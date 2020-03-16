import React, { useState } from "react";
import { Navigation } from "../types";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Button
} from "react-native";

import Categories from "../constants/Categories";

type CategoryItem = string;

interface SelectCategoryProps extends Navigation {
  route: any;
}

const selectCategory = ({ navigation, route }: SelectCategoryProps) => {
  const [selected, setSelected] = useState(route.params?.selected ?? null);

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
              <Text style={{ fontSize: 18 }}>{item}</Text>
              {selected == item && <Text>✔</Text>}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
      />
    </View>
  );
};

selectCategory["navigationOptions"] = ({ navigation }: { navigation: any }) => {
  return {
    headerTitle: "Category",
    headerLeft: (
      <Button onPress={() => navigation.navigate("Expense")} title="Cancel" />
    )
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  item: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    height: 44
  }
});

export default selectCategory;
