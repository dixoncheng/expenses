import React, { useState, useLayoutEffect } from "react";
import { Navigation, ListItem } from "../types";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import moment from "moment";
const { createClient } = require("contentful/dist/contentful.browser.min.js");

import {
  CONTENTFUL_DELIVERY_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE
} from "react-native-dotenv";

const HomeScreen = ({ navigation }: Navigation) => {
  const [items, setItems] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Expenses",
      headerRight: () => (
        <Button
          onPress={() => {
            navigation.navigate("AddExpense");
          }}
          title="Add"
        />
      )
    });
  }, [navigation]);

  const fetchData = () => {
    // console.log("fetch");
    const client = createClient({
      accessToken: CONTENTFUL_DELIVERY_TOKEN,
      space: CONTENTFUL_SPACE_ID
    });
    client
      .getEntries({
        content_type: CONTENTFUL_CONTENT_TYPE,
        select:
          "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
        order: "-fields.date"
      })
      .then((response: any) => {
        setItems(
          response.items.map((item: any) => {
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
        );
      })
      .catch(function(error: any) {
        console.log(error);
      });
  };

  const onItemPress = (item: ListItem) => {
    navigation.push("Expense", { item });
  };

  // const onItemLongPress = (item: ListItem) => {
  //   Alert.alert(
  //     "Delete this item?",
  //     `${item.category} $${parseFloat(item.amount || "0").toFixed(2)}`,
  //     [
  //       { text: "Yes", onPress: () => deleteItem(item) },
  //       { text: "No", onPress: () => {}, style: "cancel" }
  //     ]
  //   );
  // };

  // const deleteItem = (item: ListItem) => {};

  fetchData();

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }: { item: ListItem }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onItemPress(item)}
            // onLongPress={() => onItemLongPress(item)}
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
        // extraData={}
        // onEndReached={_handleLoadMore}
        // onEndReachedThreshold={0.5}
        initialNumToRender={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  item: {
    padding: 10
  }
});

export default HomeScreen;
