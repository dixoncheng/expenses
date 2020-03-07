import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Button
} from "react-native";

import Categories from "../constants/Categories";

const selectCategory = ({ navigation }) => {
  const [selected, setSelected] = useState(
    navigation.getParam("selected", null)
  );

  const onPress = item => {
    setSelected(item);
    const { params = {} } = navigation.state;
    params.setCategory(item);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Categories}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onPress(item)}>
            <View style={styles.item}>
              <Text style={{ fontSize: 18 }}>{item}</Text>
              {selected == item && <Text>✔</Text>}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item}
      />
    </View>
  );
};

selectCategory["navigationOptions"] = ({ navigation }) => {
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
