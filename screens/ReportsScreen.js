import React from 'react';
import { 
  View,
  StyleSheet,
  Text,
  DatePickerIOS,
  Button,
  ActivityIndicator,
  Modal,
  Share
} from 'react-native';

import { FileSystem } from 'expo';

import * as firebase from 'firebase';
import moment from 'moment';
import XLSX from 'xlsx';

import Categories from '../constants/Categories';

export default class ReportsScreen extends React.Component {
  state = {
    dateFrom: new Date(),
    dateTo: new Date(),
    loading: false,
    // items: [],
    showingModal: false,
    filename: ''
  };

  static navigationOptions = {
    title: 'Reports',
  };

  setDateFrom = (newDate) => {
    this.setState({ dateFrom: newDate });
  };

  setDateTo = (newDate) => {
    this.setState({ dateTo: newDate });
  }

  onGenerate = async () => {
    this.setState({ showingModal: true, loading: true });

    // retrieve all expenses for the chosen dates
    let snapshot = await firebase.database().ref('/').once('value'); //.then((snapshot) => {

      let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} });
      // console.log(arr);
      // this.setState({ items: arr });

      // generate csv
      let report = this.generateReport(arr);

      // const fileString = await FileSystem.readAsStringAsync(uri)

      // console.log(report);
      let filename = `${FileSystem.documentDirectory}Expenses-${moment(this.state.dateFrom).format('MMM-YY')}-${moment(this.state.dateTo).format('MMM-YY')}.xlsx`;
      // let filename = `${FileSystem.documentDirectory}/Expenses ${moment(this.state.dateFrom).format('MMM YY')} - ${moment(this.state.dateTo).format('MMM YY')}.xlsx`;

      // await FileSystem.writeAsStringAsync(filename, report);
      await FileSystem.writeAsStringAsync(filename, report, { encoding: 'FileSystem.EncodingTypes.Base64' });
      
      console.log(report);


      this.setState({ loading: false, filename });
      this.onShare();

    // });
  }

  generateReport = (arr) => {
    let sheetHeadingsCounters = [];
    let data = [];
    let fmt = '$0.00';
    for (let i = 0; i < arr.length; i++) {

      let c = sheetHeadingsCounters[arr[i].category] + 1 || 0;
      let cell = { 
        v: parseFloat(arr[i].amount || 0),
        z: fmt,
        c: arr[i].notes ? [{ t: arr[i].notes }] : null,
        t: 'n'
      }
      if(cell.c) {
        cell.c.hidden = true;
      }

      // if row exists and nothing in the category cell
      if(data[c] && !data[c][arr[i].category]) {
        data[c][arr[i].category] = cell;
        
      } else {

        // if(data[c]) {
        //   console.log(data[c][arr[i].category]);  
        // }


        let row = {};
        row[arr[i].category] = cell;
        data.push(row);
      }

      sheetHeadingsCounters[arr[i].category] = c;
    }
    
    // console.log(sheetHeadingsCounters);

    // add empty row to separate totals
    data.push({ ' ': '' });  

    // add totals row
    let row = {};
    for (let i = 0; i < Categories.length; i++) {
      row[Categories[i]] = {
        f: `=SUM(${XLSX.utils.encode_cell({ r:1, c:i })}:${XLSX.utils.encode_cell({ r:data.length, c:i })})`,
        z: fmt,
        t: 'n'
      }
    }
    data.push(row);  
    
    // console.log(data);

    const ws = XLSX.utils.json_to_sheet(data, { header: Categories });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* write file */
    // const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});
    // const file = DDP + "sheetjsw.xlsx";
    // writeFile(file, output(wbout), 'ascii').then((res) =>{
    //     // Alert.alert("exportFile success", "Exported to " + file);
    // }).catch((err) => { console.log("exportFile Error", "Error " + err.message); });

    // XLSX.writeFile(wb, 'test.xlsx');
    return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  }

  // writeReport = (report) => {
  //   FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}/test.xlsx`, report);
  // }


  onShare = async () => {
    try {
      const result = await Share.share({
        // message: 'React Native | A framework for building native apps using React',
        url: this.state.filename
      });

      this.setState({ showingModal: false });

      // if (result.action === Share.sharedAction) {
      //   if (result.activityType) {
      //     // shared with activity type of result.activityType
      //   } else {
      //     // shared
      //   }
      // } else if (result.action === Share.dismissedAction) {
        // dismissed
      // }
    } catch (error) {
      // alert(error.message);
      this.setState({ showingModal: false });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>From</Text>
        <DatePickerIOS
          date={this.state.dateFrom}
          onDateChange={this.setDateFrom}
          mode="date"
          style={{ 
            borderBottomWidth: 1,
            borderBottomColor: 'lightgrey' 
          }}
        />

        <Text style={styles.label}>To</Text>
        <DatePickerIOS
          date={this.state.dateTo}
          onDateChange={this.setDateTo}
          mode="date"
          style={{ 
            borderBottomWidth: 1,
            borderBottomColor: 'lightgrey' 
          }}
        />
        <Button title="Generate" onPress={this.onGenerate} />

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showingModal}
          >
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            {this.state.loading && <ActivityIndicator color="#fff" animating size="large" />}

            {/*!this.state.loading && <Button title="Share" onPress={this.onShare} />*/}
            {/*<Button title="Close" onPress={() => {this.setState({ showingModal: false })} } />*/}

          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    justifyContent: 'space-between',
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center'
  }
});
