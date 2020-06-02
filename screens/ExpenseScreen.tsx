import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Navigation } from "../types";
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
  Keyboard,
  AsyncStorage,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import moment from "moment";
import contentful from "../constants/contentful";

const {
  createClient,
} = require("contentful-management/dist/contentful-management.browser.min.js");

interface AddExpenseProps extends Navigation {
  route: any;
}

const AddExpense = ({ navigation, route }: AddExpenseProps) => {
  const cameraRef = useRef<Camera>(null);

  const [item, setItem] = useState<any>(route.params?.item || {});
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);

  const [loadedPhoto, setLoadedPhoto] = useState(null);

  const [client, setClient] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: item.id ? "Edit Expense" : "Add Expense",
      headerRight: () =>
        client && <Button onPress={() => save()} title="Save" />,
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
      ),
    });
  }, [navigation, item]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasCameraPermission(status === "granted");

      const accessToken = await AsyncStorage.getItem("accessToken");
      const contentfulClient = createClient({
        accessToken,
      });
      setClient(contentfulClient);

      if (item.photo) {
        // get asset from contentful
        contentfulClient
          .getSpace(contentful.spaceId)
          .then((space: any) => space.getEnvironment(contentful.env))
          .then((environment: any) => environment.getAsset(item.photo))
          .then((asset: any) => {
            setLoadedPhoto(asset.fields.file["en-US"].url);
          })
          .catch(console.error);
      }
    })();

    if (!item.date) {
      setItem({ ...item, date: new Date() });
    }
  }, []);

  const save = async () => {
    // console.log(item);

    try {
      // show loading spinner
      setLoading(true);

      // TODO upload photo
      let newPhoto: any = {};
      if (photoUpdated) {
        newPhoto = await uploadImageAsync(item.photo.uri);
      }

      // TODO delete existing linked image if available
      // if (photoUpdated && photoRef) {
      // }

      // save to db
      client
        .getSpace(contentful.spaceId)
        .then((space: any) => space.getEnvironment(contentful.env))
        .then((environment: any) => {
          const fields = {
            amount: { "en-US": parseFloat(item.amount) },
            notes: { "en-US": item.notes },
            date: { "en-US": item.date },
            category: { "en-US": item.category },
          };

          if (photoUpdated) {
            // @ts-ignore
            fields.photo = {
              "en-US": {
                sys: {
                  id: newPhoto.sys.id,
                  type: "Link",
                  linkType: "Asset",
                },
              },
            };
          }

          if (item.id) {
            // update
            return environment.getEntry(item.id).then((entry: any) => {
              entry.fields = { ...entry.fields, ...fields };
              return entry.update();
            });
          } else {
            // create
            return environment.createEntry(contentful.contentType, {
              fields,
            });
          }
        })
        .then((entry: any) => {
          // console.log(entry);
          return entry.publish();
        })

        .then(() => {
          // back to list
          setLoading(false);

          // TODO set home to reload
          navigation.navigate("Home", { refresh: true });
        })
        .catch(console.error);
    } catch (error) {
      // console.log("err");
      console.log(error);
      setLoading(false);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
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
        "en-US": fileName,
      },
      file: {
        "en-US": {
          contentType,
          fileName,
          file: blob,
        },
      },
    };

    return client
      .getSpace(contentful.spaceId)
      .then((space: any) => space.getEnvironment(contentful.env))
      .then((environment: any) =>
        environment.createAssetFromFiles({
          fields,
        })
      )
      .then((asset: any) => {
        // console.log("processing asset...");
        return asset.processForLocale("en-US", {
          processingCheckWait: 2000,
        });
      })
      .then((asset: any) => {
        // console.log("publishing asset...");
        return asset.publish();
      })
      .then((asset: any) => {
        // console.log(asset);
        return asset;
      })
      .catch(console.error);
  };

  const selectCategory = () => {
    navigation.navigate("SelectCategory", {
      selected: item.category,
      setCategory,
    });
  };

  const setCategory = (option: string) => {
    setItem({ ...item, category: option });
  };

  const setDate = (event: Event, newDate?: Date) => {
    setShowDatePicker(false);
    setItem({ ...item, date: newDate });
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      // let ratios = await camera.getSupportedRatiosAsync();
      // console.log(ratios);

      // let sizes = await camera.getAvailablePictureSizesAsync('4:3');
      // console.log(sizes);

      // @ts-ignore
      let photo = await cameraRef.current.takePictureAsync({
        quality: Platform.OS === "ios" ? 0.3 : 0.5,
        // base64: true
      });
      // console.log(photo);
      setPhotoUpdated(true);
      setItem({ ...item, photo });
    }
  };

  const retakePhoto = () => {
    setItem({ ...item, photo: null });
    setLoadedPhoto(null);
  };

  const pickPhoto = async () => {
    const photo = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      aspect: [4, 3],
    });

    if (!photo.cancelled) {
      setPhotoUpdated(true);
      setItem({ ...item, photo });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.textField}
          keyboardType="decimal-pad"
          placeholder="0"
          onChangeText={(amount) => {
            setItem((item) => ({ ...item, amount }));
          }}
          value={item.amount}
        />
      </View>

      <TouchableHighlight onPress={selectCategory} underlayColor="lightgrey">
        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.textField}>{item.category} ›</Text>
        </View>
      </TouchableHighlight>

      <View style={styles.row}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.textField}
          onChangeText={(notes) => setItem({ ...item, notes })}
          value={item.notes}
        />
      </View>

      {(showDatePicker || Platform.OS === "ios") && (
        <DateTimePicker
          value={item.date || new Date()}
          is24Hour={true}
          display="default"
          onChange={setDate}
        />
      )}

      {Platform.OS === "android" && (
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(true)}>
            <Text style={styles.textField}>
              {moment(item.date || new Date()).format("D MMM YYYY")}
            </Text>
          </TouchableWithoutFeedback>
        </View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            justifyContent: "flex-end",
          }}
        >
          {hasCameraPermission === null ||
            (hasCameraPermission === false && <View />)}

          {hasCameraPermission === true && !item.photo && (
            <Camera
              ref={cameraRef}
              style={{ flex: 1 }}
              type="back"
              pictureSize={Platform.OS === "ios" ? "1920x1080" : "1600x1200"}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  <View style={{ flex: 1 }}></View>

                  <View style={{ flex: 1 }}>
                    <Button title="Take photo" onPress={takePhoto} />
                  </View>

                  <TouchableOpacity style={{ flex: 1 }} onPress={pickPhoto}>
                    <Text
                      style={{
                        textAlign: "right",
                        color: "white",
                      }}
                    >
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Camera>
          )}

          {item.photo?.uri || loadedPhoto ? (
            <ImageBackground
              source={
                item?.photo?.uri ? item.photo : { uri: `https:${loadedPhoto}` }
              }
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "flex-end",
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
              justifyContent: "center",
            },
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
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 18,
  },
  textField: {
    fontSize: 18,
    flex: 1,
    textAlign: "right",
  },
});

export default AddExpense;
