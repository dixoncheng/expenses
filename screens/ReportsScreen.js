import React from 'react';
import { 
  View,
  StyleSheet,
  Text,
  DatePickerIOS,
  Button,
  ActivityIndicator,
  Modal
} from 'react-native';

import { MailComposer } from 'expo';

import * as firebase from 'firebase';
import moment from 'moment';
import XLSX from 'xlsx';

import Categories from '../constants/Categories';

export default class ReportsScreen extends React.Component {
  state = {
    dateFrom: new Date(),
    dateTo: new Date(),
    loading: false,
    items: []
  };

  static navigationOptions = {
    title: 'Reports',
  };

  setDateFrom = (newDate) => {
    this.setState({ dateFrom: newDate });
  };

  setDateTo = (newDate) => {
    this.setState({ dateTo: newDate });
  };

  onGenerate = () => {
    this.setState({ loading: true });

    // retrieve all expenses for the chosen dates
    firebase.database().ref('/').once('value').then((snapshot) => {

      let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} });
      // console.log(arr);
      this.setState({ items: arr });

      // generate csv
      this.generateReport(arr);


      this.setState({ loading: false });

      // attach to email and send
      // MailComposer.composeAsync({ 
      //   recipients: [ 'dixontk@gmail.com' ],
      //   subject: `Expense report: ${moment(this.state.dateFrom).format('MMMM D, YYYY')} - ${moment(this.state.dateTo).format('MMMM D, YYYY')}`,
      //   body: '',
      //   // attachments: []
      // });
      // alert('Report has been emailed');

    });
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

    XLSX.writeFile(wb, 'test.xlsx');

  }

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
          visible={this.state.loading}
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
            <ActivityIndicator color="#fff" animating size="large" />
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
