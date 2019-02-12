import React from 'react';
import {
  FlatList,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View
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

    firebase.database().ref('/').on('value', (snapshot) => {
      let arr = Object.keys(snapshot.val()).map((key) => { return {key: key, ...snapshot.val()[key]} }).reverse();
      // console.log(arr);
      this.setState({ items: arr });
    });
  }

  _addExpense(visible) {
    this.props.navigation.navigate('Expense');
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
    console.log(item);
    // this.props.navigation.navigate('AddExpense')
    
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.items}
          renderItem={
            ({item}) => <TouchableOpacity style={styles.item} onPress={() => this.onItemPress(item)}>
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