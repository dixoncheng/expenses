import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Button, StyleSheet, SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import { CONTENTFUL_CLIENT_ID } from "react-native-dotenv";
import contentful from "../constants/contentful";
import { loginUser } from "../actions";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const dispatch = useDispatch();

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
      dispatch(loginUser(response.params.access_token));
    }
  }, [response]);

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
