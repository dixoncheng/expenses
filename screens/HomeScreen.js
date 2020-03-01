import React from "react";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";

import moment from "moment";
const { createClient } = require("contentful/dist/contentful.browser.min.js");

import {
  CONTENTFUL_DELIVERY_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE
} from "react-native-dotenv";

export default class HomeScreen extends React.Component {
  state = {
    items: [],
    page: 1,
    loadingMore: false
  };

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: "Expenses v0.2",
      headerRight: <Button onPress={() => params.addExpense()} title="Add" />
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({
      addExpense: () => this._addExpense(true)
    });
    this._fetchData();
  }

  _fetchData = () => {
    // console.log("fetch");
    const client = createClient({
      accessToken: CONTENTFUL_DELIVERY_TOKEN,
      space: CONTENTFUL_SPACE_ID
    });
    client
      .getEntries({
        content_type: CONTENTFUL_CONTENT_TYPE,
        select:
          "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo"
      })
      .then(response => {
        this.setState({
          items: response.items.map(item => {
            // if (item.fields.photo) {
            //   console.log(item);
            // }
            return {
              id: item.sys.id,
              photo:
                item.fields.photo && item.fields.photo.fields.file
                  ? `https:${item.fields.photo.fields.file.url}`
                  : null,
              date: new Date(item.fields.date),
              amount: item.fields.amount + "",
              category: item.fields.category,
              notes: item.fields.notes
            };
          })
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  _addExpense(visible) {
    this.props.navigation.navigate("AddExpense", { refresh: this._fetchData });
  }

  onItemPress = item => {
    // console.log(item);
    this.props.navigation.navigate("Expense", {
      item,
      refresh: this._fetchData
    });
  };

  onItemLongPress = item => {
    Alert.alert(
      "Delete this item?",
      `${item.category} $${parseFloat(item.amount || 0).toFixed(2)}`,
      [
        { text: "Yes", onPress: () => this.deleteItem(item) },
        { text: "No", onPress: () => {}, style: "cancel" }
      ]
    );
  };

  deleteItem = item => {
    // firebase
    //   .database()
    //   .ref(item.key)
    //   .remove();
    // // delete linked image
    // if (item.photoRef) {
    //   firebase
    //     .storage()
    //     .ref()
    //     .child(item.photoRef)
    //     .delete();
    // }
  };

  _handleLoadMore = () => {
    // console.log("_handleLoadMore");
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => this.onItemPress(item)}
              onLongPress={() => this.onItemLongPress(item)}
            >
              <Text>{item.category}</Text>
              <Text>
                $
                {parseFloat(item.amount) >= 0
                  ? parseFloat(item.amount).toFixed(2)
                  : 0}
              </Text>
              <Text>{moment(item.date).format("MMMM D, YYYY")}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{ borderBottomWidth: 1, borderBottomColor: "lightgrey" }}
            />
          )}
          // keyExtractor={(item, index) => index.toString()}
          // extraData={this.state}
          // onEndReached={this._handleLoadMore}
          // onEndReachedThreshold={0.5}
          initialNumToRender={10}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  item: {
    padding: 10
  }
});
