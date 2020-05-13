import React, { useState } from "react";
import { PASSWORD } from "react-native-dotenv";
import {
  Button,
  StyleSheet,
  SafeAreaView,
  TextInput,
  AsyncStorage
} from "react-native";

const LoginScreen = ({ login }: { login: Function }) => {
  const [password, setPassword] = useState("");

  const validate = () => {
    if (password === PASSWORD) {
      storeData();
      login();
    } else {
      alert("Password incorrect");
    }
  };

  const storeData = async () => {
    try {
      await AsyncStorage.setItem("expensesLoggedIn", "1");
    } catch (error) {
      // Error saving data
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        value={password}
        onChangeText={password => setPassword(password)}
        placeholder="password"
        secureTextEntry={true}
        style={styles.input}
        onSubmitEditing={validate}
      />
      <Button onPress={validate} title="Login" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  input: {
    // borderColor: 'red',
    width: 200,
    fontSize: 20,
    height: 44,
    padding: 10,
    borderWidth: 1,
    marginVertical: 10
  }
});

export default LoginScreen;
