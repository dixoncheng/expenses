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
    items: [],
    page: 1,
    loadingMore: false
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: 'Expenses1',
      headerRight: (
        <Button
          onPress={() => params.addExpense()}
          title="Add"
        />
      ),
    }
  };

  componentDidMount() {
    this.props.navigation.setParams({ addExpense: () => this._addExpense(true) });
    this._fetchData();
  }

  _fetchData = () => {
    firebase.database().ref('/').orderByChild('date').limitToLast(20).on('value', (snapshot) => {
    // firebase.database().ref('/').orderByChild('date').limitToLast(20).startAt('1568454153000').on('value', (snapshot) => {
      

      console.log(snapshot);

      // var lastVisible = snapshot.docs[snapshot.docs.length-1];
      // console.log("last", lastVisible);

      let arr = [];
      snapshot.forEach(function(item) {
        arr.push({ key: item.key, ...item.val() });
      });
      this.setState({ items: arr.reverse() });
    });
  }

  _addExpense(visible) {
    this.props.navigation.navigate('AddExpense');
  }

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
    // delete linked image
    if(item.photoRef) {
      firebase.storage().ref().child(item.photoRef).delete();
    }
  }

  _handleLoadMore = () => {
    console.log(1);
    // this.setState(
    //   (prevState, nextProps) => ({
    //     page: prevState.page + 1,
    //     loadingMore: true
    //   }),
    //   () => {
    //     this._fetchData();
    //   }
    // );
  };

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
          onEndReached={this._handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
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