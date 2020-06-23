import React, { useEffect, useLayoutEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeArea } from "react-native-safe-area-context";
import { Navigation, ListItem } from "../types";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from "react-native";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, getExpenses } from "../actions";

import Colors from "../constants/Colors";
import Theme from "../constants/Theme";

interface HomeScreenProps extends Navigation {
  route: any;
}

const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: any) => state.expenseReducer);
  const insets = useSafeArea();
  const win = Dimensions.get("window");
  const headerHeight = (203 * win.width) / 750;

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     // headerTitleAlign: "center",
  //     // headerStyle: {
  //       // height: 100 + insets.top,
  //     // },
  //     // headerTitle: (
  //     //   <Image
  //     //     source={require("../assets/images/Expensies-Header.png")}
  //     //     style={{
  //     //       width: 100,
  //     //       height: 100,
  //     //       resizeMode: "contain",
  //     //     }}
  //     //   />
  //     // ),

  //     // headerLeft: () => (
  //     //   <Button
  //     //     onPress={() => {
  //     //       dispatch(logoutUser());
  //     //     }}
  //     //     title="Logout"
  //     //   />
  //     // ),
  //     // headerRight: () => (
  //     //   <Button
  //     //     onPress={() => {
  //     //       navigation.navigate("AddExpense");
  //     //     }}
  //     //     title="Add"
  //     //   />
  //     // ),
  //   });
  // }, [navigation]);

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
      <View style={{ backgroundColor: "white", paddingTop: insets.top }}>
        <Image
          source={require("../assets/images/Expensies-Header.png")}
          style={{
            width: "100%",
            height: headerHeight,
            resizeMode: "contain",
          }}
        />
      </View>

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
    fontFamily: Theme.fontFamily,
    fontWeight: "bold",
    marginBottom: 4,
    color: Colors.tintColor,
  },
  itemDate: {
    fontFamily: Theme.fontFamily,
    textTransform: "uppercase",
    // color: Colors.tintColor,
    color: "#9e9b8f",
    fontSize: 12,
  },
  itemAmount: {
    fontFamily: Theme.fontFamily,
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
