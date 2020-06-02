import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button, StyleSheet, SafeAreaView, AsyncStorage } from "react-native";
import { CONTENTFUL_CLIENT_ID } from "react-native-dotenv";
import contentful from "../constants/contentful";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ login }: { login: Function }) => {
  const useProxy = true;

  const discovery = {
    authorizationEndpoint: contentful.authorizationEndpoint,
  };

  const redirectUri = makeRedirectUri({
    native: "expenses://redirect",
    useProxy,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CONTENTFUL_CLIENT_ID,
      scopes: ["content_management_read", "content_management_manage"],
      responseType: "token",
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response && response.type === "success") {
      console.log(response);
      saveToken(response.params.access_token);
    }
  }, [response]);

  const saveToken = async (accessToken: string) => {
    try {
      await AsyncStorage.setItem("accessToken", accessToken);
      login();
    } catch (error) {
      // Error saving data
      alert("Login error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button
        disabled={!request}
        onPress={() =>
          promptAsync({
            useProxy,
            redirectUri,
          })
        }
        title="Login with Contentful"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default LoginScreen;
