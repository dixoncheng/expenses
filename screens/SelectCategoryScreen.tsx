import React, { useState, useLayoutEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Navigation } from "../types";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Button,
} from "react-native";
import Colors from "../constants/Colors";
import Categories from "../constants/Categories";
import Theme from "../constants/Theme";

type CategoryItem = string;

interface SelectCategoryProps extends Navigation {
  route: any;
}

const selectCategory = ({ navigation, route }: SelectCategoryProps) => {
  const [selected, setSelected] = useState(route.params?.selected ?? null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Category",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5
            style={styles.headerButton}
            name="arrow-left"
            size={26}
            color={Colors.tintColor}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onPress = (item: CategoryItem) => {
    setSelected(item);
    route.params.setCategory(item);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Categories}
        renderItem={({ item }: { item: CategoryItem }) => (
          <TouchableOpacity onPress={() => onPress(item)}>
            <View style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
              {selected == item && <Text>✔</Text>}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

selectCategory["navigationOptions"] = ({ navigation }: { navigation: any }) => {
  return {
    headerTitle: "Category",
    headerLeft: (
      <Button onPress={() => navigation.navigate("Expense")} title="Cancel" />
    ),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    // height: 44,
    borderBottomWidth: 2,
    borderBottomColor: "white",
  },
  itemText: {
    fontFamily: Theme.fontFamily,
    fontSize: 16,
    color: Colors.tintColor,
  },
  headerButton: {
    padding: 12,
    paddingTop: 9,
  },
});

export default selectCategory;
