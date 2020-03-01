import React from "react";
import { PASSWORD } from "react-native-dotenv";
import {
  Button,
  StyleSheet,
  SafeAreaView,
  TextInput,
  AsyncStorage
} from "react-native";

export default class LoginScreen extends React.Component {
  state = {
    password: "",
    error: false
  };

  validate = () => {
    if (this.state.password === PASSWORD) {
      this._storeData();
      this.props.login();
    } else {
      alert("Password incorrect");
    }
  };

  _storeData = async () => {
    try {
      await AsyncStorage.setItem("expensesLoggedIn", "1");
    } catch (error) {
      // Error saving data
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          value={this.state.password}
          onChangeText={password => this.setState({ password })}
          placeholder="password"
          secureTextEntry={true}
          style={styles.input}
          onSubmitEditing={this.validate}
        />
        <Button onPress={this.validate} title="Login" />
      </SafeAreaView>
    );
  }
}

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
