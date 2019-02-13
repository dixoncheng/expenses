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
