import React, { useEffect, useLayoutEffect } from "react";
import { Navigation, ListItem } from "../types";
import {
  FlatList,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, fetchExpenses } from "../actions";

interface HomeScreenProps extends Navigation {
  route: any;
}

const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: any) => state.expenseReducer);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Expenses",
      headerLeft: () => (
        <Button
          onPress={() => {
            dispatch(logoutUser());
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

  useEffect(() => {
    dispatch(fetchExpenses());
  }, []);

  if (route.params?.refresh) {
    dispatch(fetchExpenses());
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
