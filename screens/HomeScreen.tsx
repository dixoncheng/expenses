import React, { useEffect, useLayoutEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Navigation, ListItem } from "../types";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, getExpenses } from "../actions";

import Colors from "../constants/Colors";

interface HomeScreenProps extends Navigation {
  route: any;
}

const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: any) => state.expenseReducer);
  useLayoutEffect(() => {
    navigation.setOptions({
      // headerTitleAlign: "center",
      headerStyle: {
        height: 140,
      },
      headerTitle: (
        // <Text>
        //   <Image
        //     source={require("../assets/images/robot-dev.png")}
        //     style={{
        //       // width: 10,
        //       height: 50,
        //       resizeMode: "contain",
        //     }}
        //   />
        // </Text>
        // <Image
        //     source={require("../assets/images/Expensies-Header.png")}
        //     style={{
        //       width: "100%",
        //       // height: 50,
        //       // resizeMode: "contain",
        //     }}
        //   />
        <Image
          source={require("../assets/images/Expensies-Header.png")}
          style={{
            width: 380,
            height: 99,
            resizeMode: "contain",
          }}
        />
      ),
      // headerLeft: () => (
      //   <Button
      //     onPress={() => {
      //       dispatch(logoutUser());
      //     }}
      //     title="Logout"
      //   />
      // ),
      // headerRight: () => (
      //   <Button
      //     onPress={() => {
      //       navigation.navigate("AddExpense");
      //     }}
      //     title="Add"
      //   />
      // ),
    });
  }, [navigation]);

  useEffect(() => {
    dispatch(getExpenses());
  }, []);

  if (route.params?.refresh) {
    dispatch(getExpenses());
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

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }: { item: ListItem }) => (
          <TouchableOpacity
            onPress={() => onItemPress(item)}
            // onLongPress={() => onItemLongPress(item)}
          >
            <View style={styles.item}>
              <View>
                <Text style={styles.itemCat}>{item.category}</Text>
                <Text style={styles.itemDate}>
                  {moment(item.date).format("D MMM YYYY")}
                </Text>
              </View>
              <Text style={styles.itemAmount}>
                $
                {parseFloat(item.amount) >= 0
                  ? parseFloat(item.amount).toFixed(2)
                  : 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ borderBottomWidth: 2, borderBottomColor: "white" }} />
        )}
        // keyExtractor={(item, index) => index.toString()}
        // extraData={}
        // onEndReached={_handleLoadMore}
        // onEndReachedThreshold={0.5}
        initialNumToRender={10}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        style={styles.fab}
      >
        <FontAwesome5 name="plus-circle" size={36} color="#496447" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f6",
  },
  item: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCat: {
    fontFamily: "Futura",
    fontWeight: "bold",
    marginBottom: 4,
    color: Colors.tintColor,
  },
  itemDate: {
    fontFamily: "Futura",
    textTransform: "uppercase",
    // color: Colors.tintColor,
    color: "#9e9b8f",
    fontSize: 12,
  },
  itemAmount: {
    fontFamily: "Futura",
    fontSize: 18,
    color: "#496447",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
});

export default HomeScreen;
