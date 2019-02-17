import React from 'react';
import { 
  Platform,
  View,
  StyleSheet,
  Text,
  DatePickerIOS,
  Button,
  ActivityIndicator,
  Modal,
  Share,
  DatePickerAndroid,
  TouchableHighlight,
  Alert
} from 'react-native';

import { FileSystem, MailComposer } from 'expo';

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
    // set to last second on the day so the expenses from that day are included
    newDate.setHours(23, 59, 59);
    // console.log(newDate.getTime());
    // console.log(moment(newDate).format('MMMM Do YYYY, h:mm:ss a'));
    this.setState({ dateTo: newDate }); //add 11pm 59 min
  }

  onGenerate = async () => {
    this.setState({ showingModal: true, loading: true });

    // console.log(this.state);
    // console.log(`startAt: ${this.state.dateFrom.getTime()}`);
    // console.log(`endAt: ${this.state.dateTo.getTime()}`);

    // retrieve all expenses for the chosen dates
    // let snapshot = await firebase.database().ref('/').once('value');
    let snapshot = await firebase.database().ref('/').orderByChild('date').startAt(this.state.dateFrom.getTime()).endAt(this.state.dateTo.getTime()).once('value');

    if(snapshot.val()) {
      let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} });
      // console.log(arr);
      // this.setState({ showingModal: false, loading: false });
      // return;

      // generate csv
      let report = this.generateReport(arr);
      let filename = `${FileSystem.documentDirectory}Expenses-${moment(this.state.dateFrom).format('MMM-YY')}-${moment(this.state.dateTo).format('MMM-YY')}.xlsx`;
      // let filename = `${FileSystem.documentDirectory}/Expenses ${moment(this.state.dateFrom).format('MMM YY')} - ${moment(this.state.dateTo).format('MMM YY')}.xlsx`;
     
      await FileSystem.writeAsStringAsync(filename, report, { encoding: FileSystem.EncodingTypes.Base64 });

      this.setState({ loading: false, filename });
      
      if(Platform.OS === 'ios') {
        this.onShare();

      } else {
        this.setState({ showingModal: false });

        MailComposer.composeAsync({ 
          recipients: [ 'dixontk@gmail.com' ],
          subject: `Expense report ${moment(this.state.dateFrom).format('MMM YY')} - ${moment(this.state.dateTo).format('MMM YY')}`,
          attachments: [ filename ]
        });
      }

    } else {
      this.setState({ showingModal: false, loading: false });

      setTimeout(() => {
        Alert.alert('No records found');
      }, 500);

    }
    
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

  selectDateAndroid = async (which) => {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        // Use `new Date()` for current date.
        // May 25 2020. Month 0 is January.
        date: which === 'from' ? this.state.dateFrom : this.state.dateTo 
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        // Selected year, month (0-11), day
        which === 'from' ? this.setDateFrom(new Date(year, month, day)) : this.setDateTo(new Date(year, month, day));
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  render() {
    return (
      <View style={styles.container}>

        {Platform.OS === 'ios' &&
        <View>
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
        </View>
        }
        
        {Platform.OS !== 'ios' &&
        <View>
          <TouchableHighlight
            onPress={() => this.selectDateAndroid('from')}
            underlayColor="lightgrey"
            >
            <View style={styles.row}>
              <Text style={styles.label}>Date from</Text>
              <Text style={styles.label}>{moment(this.state.dateFrom).format('D-MMM-YY')}</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => this.selectDateAndroid('to')}
            underlayColor="lightgrey"
            >
            <View style={styles.row}>
              <Text style={styles.label}>Date to</Text>
              <Text style={styles.label}>{moment(this.state.dateTo).format('D-MMM-YY')}</Text>
            </View>
          </TouchableHighlight>
        </View>
        }

        <Button title="Generate" onPress={this.onGenerate} />

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showingModal}
          onRequestClose={() => {}}
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
    // flex: 1,
    width: '100%',
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
