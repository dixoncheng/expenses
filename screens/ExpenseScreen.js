import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Keyboard
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const {
  createClient
} = require("contentful-management/dist/contentful-management.browser.min.js");

import {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE,
  CONTENTFUL_ENVIRONMENT
} from "react-native-dotenv";

const AddExpense = ({ navigation, route }) => {
  const [item, setItem] = useState(route.params?.item ?? {});
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);

  useLayoutEffect(() => {
    console.log("layouteffect");
    // console.log(route);
    console.log(item);
    navigation.setOptions({
      headerTitle: item.id ? "Edit Expense" : "Add Expense",
      headerRight: () => <Button onPress={() => save()} title="Save" />,
      headerLeft: () => (
        <Button
          onPress={() =>
            // route.params?.item
            //   ? navigation.navigate("Home")
            //   : navigation.navigate("TabNavigator")
            navigation.navigate("Home")
          }
          title={route.params?.item ? "Back" : "Cancel"}
        />
      )
    });
  }, [navigation, item]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

  const save = () => {
    console.log(item);
    setLoading(false);
    return;

    try {
      // show loading spinner
      setLoading(true);

      // TODO upload photo
      let newPhoto = {};
      if (photoUpdated) {
        // newPhoto = await uploadImageAsync(photo.uri);
      }

      // TODO delete existing linked image if available
      // if (photoUpdated && photoRef) {
      // }

      // save to db
      const client = createClient({
        accessToken: CONTENTFUL_MANAGEMENT_TOKEN
      });

      client
        .getSpace(CONTENTFUL_SPACE_ID)
        .then(space => space.getEnvironment(CONTENTFUL_ENVIRONMENT))
        .then(environment => {
          const fields = {
            amount: { "en-US": parseFloat(item.amount) },
            notes: { "en-US": item.notes },
            date: { "en-US": item.date },
            category: { "en-US": item.category }
          };

          if (photoUpdated) {
            fields.photo = {
              "en-US": {
                sys: {
                  id: newPhoto.sys.id,
                  type: "Link",
                  linkType: "Asset"
                }
              }
            };
          }

          if (item.id) {
            // update
            return environment.getEntry(item.id).then(entry => {
              entry.fields = { ...entry.fields, ...fields };
              return entry.update();
            });
          } else {
            // create
            return environment.createEntry(CONTENTFUL_CONTENT_TYPE, {
              fields
            });
          }
        })
        .then(entry => {
          // console.log(entry);
          return entry.publish();
        })

        .then(() => {
          // back to list
          setLoading(false);
          navigation.state.params.refresh();

          if (item.id) {
            // update
            navigation.navigate("Home");
          } else {
            // create
            navigation.navigate("TabNavigator");
          }
        })
        .catch(console.error);
    } catch (error) {
      // console.log("err");
      console.log(error);
      setLoading(false);
    }
  };

  const uploadImageAsync = async uri => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "arraybuffer";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const fileName = uri.split("/").pop();
    // console.log(fileName);

    let uriParts = uri.split(".");
    let fileType = uriParts[uriParts.length - 1];
    let contentType = `images/${fileType}`;
    // console.log(contentType);

    let fields = {
      title: {
        "en-US": fileName
      },
      file: {
        "en-US": {
          contentType,
          fileName,
          file: blob
        }
      }
    };

    const client = createClient({
      accessToken: CONTENTFUL_MANAGEMENT_TOKEN
    });

    return client
      .getSpace(CONTENTFUL_SPACE_ID)
      .then(space => space.getEnvironment(CONTENTFUL_ENVIRONMENT))
      .then(environment =>
        environment.createAssetFromFiles({
          fields
        })
      )
      .then(asset => {
        // console.log("processing asset...");
        return asset.processForLocale("en-US", {
          processingCheckWait: 2000
        });
      })
      .then(asset => {
        // console.log("publishing asset...");
        return asset.publish();
      })
      .then(asset => {
        // console.log(asset);
        return asset;
      })
      .catch(console.error);
  };

  const selectCategory = () => {
    navigation.navigate("SelectCategory", {
      selected: item.category,
      setCategory
    });
  };

  const setCategory = option => {
    setItem({ ...item, category: option });
  };

  const setDate = (event, newDate) => {
    setItem({ ...item, date: newDate });
  };

  const takePhoto = async () => {
    if (this.camera) {
      // let ratios = await camera.getSupportedRatiosAsync();
      // console.log(ratios);

      // let sizes = await camera.getAvailablePictureSizesAsync('4:3');
      // console.log(sizes);

      let photo = await camera.takePictureAsync({
        quality: Platform.OS === "ios" ? 0.3 : 0.5
        // base64: true
      });
      // console.log(photo);
      setPhotoUpdated(true);
      setItem({ ...item, photo });
    }
  };

  const retakePhoto = () => {
    setItem({ ...item, photo: null });
  };

  const pickPhoto = async () => {
    const photo = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.cancelled) {
      setPhotoUpdated(true);
      setItem({ ...item, photo });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={{
            fontSize: 18,
            flex: 1,
            textAlign: "right"
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          onChangeText={amount => {
            setItem(item => ({ ...item, amount }));
          }}
          value={item.amount}
        />
      </View>

      <TouchableHighlight onPress={selectCategory} underlayColor="lightgrey">
        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text
            style={{
              fontSize: 18,
              textAlign: "right"
            }}
          >
            {item.category} ›
          </Text>
        </View>
      </TouchableHighlight>

      <View style={styles.row}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={{
            fontSize: 18,
            flex: 1,
            textAlign: "right"
          }}
          // keyboardType="number-pad"
          // placeholder="0"
          onChangeText={notes => setItem({ ...item, notes })}
          value={item.notes}
        />
      </View>

      <DateTimePicker
        value={item.date || new Date()}
        is24Hour={true}
        display="default"
        onChange={setDate}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            justifyContent: "flex-end"
          }}
        >
          {hasCameraPermission === null ||
            (hasCameraPermission === false && <View />)}

          {hasCameraPermission === true && !item.photo && (
            <Camera
              ref={ref => {
                camera = ref;
              }}
              style={{ flex: 1 }}
              type="back"
              pictureSize={Platform.OS === "ios" ? "1920x1080" : "1600x1200"}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  justifyContent: "flex-end"
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 10
                  }}
                >
                  <View style={{ flex: 1 }}></View>

                  <View style={{ flex: 1 }}>
                    <Button title="Take photo" onPress={takePhoto} />
                  </View>

                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={pickPhoto}
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={{
                        textAlign: "right",
                        color: "white"
                      }}
                    >
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Camera>
          )}

          {item.photo ? (
            <ImageBackground
              source={item.photo.uri ? item.photo : { uri: item.photo }}
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "flex-end"
              }}
            >
              <Button title="Retake photo" onPress={retakePhoto} />
            </ImageBackground>
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => {}}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    justifyContent: "space-between"
  },
  label: {
    fontSize: 18
  }
});

export default AddExpense;
