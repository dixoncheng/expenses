import React from 'react';
import {
  FlatList,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Alert
} from 'react-native';

import * as firebase from 'firebase';
import moment from 'moment';

export default class HomeScreen extends React.Component {
  state = {
    items: []
  }

  componentDidMount() {
    this.props.navigation.setParams({ addExpense: () => this._addExpense(true) });
    
    // firebase.database().ref('/').once('value').then((snapshot) => {
    //   let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} });
    //   // console.log(arr);
    //   this.setState({ items: arr });
    // });

    firebase.database().ref('/').limitToLast(20).on('value', (snapshot) => {
      let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} }).reverse();
      // console.log(arr);
      this.setState({ items: arr });
    });
  }

  _addExpense(visible) {
    this.props.navigation.navigate('AddExpense');
  }

  static navigationOptions = ({ navigation }) => {

    const { params = {} } = navigation.state;

    return {
      headerTitle: 'Expenses',
      headerRight: (
        <Button
          onPress={() => params.addExpense()}
          title="Add"
        />
      ),
    }
  };

  onItemPress = (item) => {
    // console.log(item);
    this.props.navigation.navigate('Expense', { item });
  }

  onItemLongPress = (item) => {
    Alert.alert(
      'Delete this item?',
      `${item.category} $${parseFloat(item.amount || 0).toFixed(2)}`,
      [
        {text: 'Yes', onPress: () => this.deleteItem(item) },
        {text: 'No', onPress: () => {}, style: 'cancel'},
      ]
    );
  }

  deleteItem = (item) => {
    firebase.database().ref(item.key).remove();
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.items}
          renderItem={
            ({item}) => <TouchableOpacity 
              style={styles.item} 
              onPress={() => this.onItemPress(item)}
              onLongPress={() => this.onItemLongPress(item)}>
              <Text>{item.category}</Text>
              <Text>${parseFloat(item.amount || 0).toFixed(2)}</Text>
              <Text>{moment(item.date).format('MMMM D, YYYY')}</Text>
            </TouchableOpacity>}
          ItemSeparatorComponent={() => (<View style={{ borderBottomWidth: 1, borderBottomColor: 'lightgrey' }} />)}
          keyExtractor={(item, index) => index.toString()}
          extraData={this.state}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    padding: 10,
  },
});