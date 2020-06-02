import React, { useState, useEffect, useLayoutEffect } from "react";
import { Navigation, ListItem } from "../types";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
} from "react-native";
import moment from "moment";
import contentful from "../constants/contentful";

const {
  createClient,
} = require("contentful-management/dist/contentful-management.browser.min.js");

interface HomeScreenProps extends Navigation {
  route: any;
}

const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const [items, setItems] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Expenses",
      headerLeft: () => (
        <Button
          onPress={() => {
            AsyncStorage.removeItem("accessToken");
          }}
          title="Logout"
        />
      ),
      headerRight: () => (
        <Button
          onPress={() => {
            navigation.navigate("AddExpense");
          }}
          title="Add"
        />
      ),
    });
  }, [navigation]);

  const fetchData = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const client = createClient({
      accessToken,
    });
    client
      .getSpace(contentful.spaceId)
      .then((space: any) => space.getEnvironment(contentful.env))
      .then((environment: any) =>
        environment.getEntries({
          content_type: contentful.contentType,
          select:
            "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
          order: "-fields.date",
        })
      )
      .then((response: any) => {
        // console.log(response);
        setItems(
          response.items.map(
            ({ sys, fields: { photo, date, amount, category, notes } }) => {
              // if (item.fields.photo) {
              //   console.log(item);
              // }
              return {
                id: sys.id,
                // photo:
                //   item.fields.photo && item.fields.photo.fields.file
                //     ? `https:${item.fields.photo.fields.file.url}`
                //     : null,
                photo: photo && photo["en-US"].sys.id,
                date: date && new Date(date["en-US"]),
                amount: amount && amount["en-US"] + "",
                category: category && category["en-US"],
                notes: notes && notes["en-US"],
              };
            }
          )
        );
      })
      .catch(function (error: any) {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (route.params?.refresh) {
    fetchData();
  }

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

  // console.log(items);

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
    backgroundColor: "#fff",
  },
  item: {
    padding: 10,
  },
});

export default HomeScreen;
