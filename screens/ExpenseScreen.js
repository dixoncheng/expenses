import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  DatePickerIOS,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  DatePickerAndroid,
  Keyboard
} from "react-native";

import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import * as firebase from "firebase";
// import uuid from "uuid";
import moment from "moment";

import Categories from "../constants/Categories";

// import RNFetchBlob from "rn-fetch-blob";

const {
  createClient
} = require("contentful-management/dist/contentful-management.browser.min.js");
// const spaceId = "2py99kpzwf1f";
// const accessToken = "CFPAT-bE9_7CUwF3cfHG7mIW_yWGigSsj4UF3qaLt-eJ_nqLk";

import {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE,
  CONTENTFUL_ENVIRONMENT
} from "react-native-dotenv";

export default class AddExpense extends React.Component {
  state = {
    key: null,
    date: new Date(),
    amount: null,
    category: Categories[0],
    photo: null,
    notes: null,
    hasCameraPermission: null,
    loading: false,
    photoRef: null,
    photoUpdated: false
  };

  async componentDidMount() {
    let item = this.props.navigation.getParam("item");
    if (item) {
      this.setState(item);
    }

    this.props.navigation.setParams({ save: this.save });

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });

    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      headerTitle: params.item ? "Edit Expense" : "Add Expense",
      headerLeft: (
        <Button
          onPress={() =>
            params.item
              ? navigation.navigate("Home")
              : navigation.navigate("TabNavigator")
          }
          title={params.item ? "Back" : "Cancel"}
        />
      ),
      headerRight: (
        <Button
          // onPress={navigation.getParam('save')}
          onPress={() => params.save()}
          title="Save"
        />
      )
      // headerBackTitle: 'Cancel'
    };
  };

  save = async () => {
    try {
      // show loading spinner
      this.setState({ loading: true });

      // upload photo
      let photoUrl = "";
      let photoRef = "";
      if (this.state.photoUpdated) {
        photoRef = await this.uploadImageAsync(this.state.photo.uri);
        photoUrl = await photoRef.getDownloadURL();
      } else {
        photoUrl = this.state.photo;
      }

      // delete existing linked image if available
      if (this.state.photoUpdated && this.state.photoRef) {
        // firebase
        //   .storage()
        //   .ref()
        //   .child(this.state.photoRef)
        //   .delete();
      }

      // save to db
      // await firebase
      //   .database()
      //   .ref(this.state.key || new Date().getTime())
      //   .set({
      //     date: this.state.date.getTime(),
      //     amount: this.state.amount,
      //     category: this.state.category,
      //     notes: this.state.notes,
      //     photo: photoUrl || "",
      //     photoRef: photoRef.fullPath || ""
      //   });
      const client = createClient({
        accessToken: CONTENTFUL_MANAGEMENT_TOKEN
      });

      client
        .getSpace(CONTENTFUL_SPACE_ID)
        .then(space => space.getEnvironment(CONTENTFUL_ENVIRONMENT))
        .then(environment =>
          environment.createEntryWithId(
            CONTENTFUL_CONTENT_TYPE,
            this.state.id,
            {
              fields: {
                amount: {
                  "en-US": this.state.amount
                }
              }
            }
          )
        )

        .then(asset => {
          console.log("prcessing...");
          return asset.processForLocale("en-US", {
            processingCheckWait: 2000
          });
        })
        .then(asset => {
          console.log("publishing...");
          return asset.publish();
        })

        .then(asset => console.log(asset))
        .catch(console.error);

      // back to list
      this.setState({ loading: false });

      if (this.state.key) {
        this.props.navigation.navigate("Home");
      } else {
        this.props.navigation.navigate("TabNavigator");
      }
    } catch ({ code, message }) {
      console.log(message);
      this.setState({ loading: false });
    }
  };

  // uploadImageAsync = async (uri) => {
  //   // Why are we using XMLHttpRequest? See:
  //   // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  //   const blob = await new Promise((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.onload = function() {
  //       resolve(xhr.response);
  //     };
  //     xhr.onerror = function(e) {
  //       console.log(e);
  //       reject(new TypeError('Network request failed'));
  //     };
  //     xhr.responseType = 'blob';
  //     xhr.open('GET', uri, true);
  //     xhr.send(null);
  //   });

  //   // upload to firebase
  //   const ref = firebase
  //     .storage()
  //     .ref()
  //     .child(uuid.v4());
  //   const snapshot = await ref.put(blob);

  //   // We're done with the blob, close and release it
  //   blob.close();

  //   // return await snapshot.ref.getDownloadURL();
  //   return await snapshot.ref;
  // }

  uploadImageAsync = async uri => {
    // console.log(uri);
    // console.log(this.state.photo);
    // const fileName = uri.split("/").pop();
    const fileName = "test.jpg";

    // console.log(3);
    // Infer the type of the image
    // let match = /\.(\w+)$/.exec(filename);

    let uriParts = uri.split(".");
    let fileType = uriParts[uriParts.length - 1];

    // console.log(4);
    // let contentType = match ? `image/${match[1]}` : `image`;
    let contentType = `images/${fileType}`;
    // console.log(2);
    const client = createClient({
      accessToken: CONTENTFUL_MANAGEMENT_TOKEN
    });

    // console.log(client);
    // console.log(spaceId);
    // let formData = new FormData();
    // formData.append("photo", {
    //   uri,
    //   name: `photo.${fileType}`,
    //   type: `image/${fileType}`
    // });
    // console.log(1);
    // console.log("bbbbbbb");

    // try {
    //   const space = await client.getSpace(spaceId);

    //   console.log("space");
    //   console.log(space);
    // } catch ({ message }) {
    //   console.log("err");
    //   console.log(message);
    // }

    // console.log("aaaaaaaaa space");

    // return true;

    // return await client
    //   .getSpace(spaceId)
    //   .then(space => space.getEnvironment("master"))
    //   .then(environment => {
    //     environment
    //       .createUpload({ file: uploadStream })
    //       .then(upload => {
    //         console.log("creating asset...");
    //         return space
    //           .createAsset({
    //             fields: {
    //               title: {
    //                 "en-US": fileName
    //               },
    //               file: {
    //                 "en-US": {
    //                   fileName: fileName,
    //                   contentType: contentType,
    //                   uploadFrom: {
    //                     sys: {
    //                       type: "Link",
    //                       linkType: "Upload",
    //                       id: upload.sys.id
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           })
    //           .then(asset => {
    //             console.log("prcessing...");
    //             return asset.processForLocale("en-US", {
    //               processingCheckWait: 2000
    //             });
    //           })
    //           .then(asset => {
    //             console.log("publishing...");
    //             return asset.publish();
    //           })
    //           .then(asset => {
    //             console.log(asset);
    //             return asset;
    //           });
    //       })
    //       .catch(err => {
    //         console.log(err);
    //       });
    //   });

    // // Why are we using XMLHttpRequest? See:
    // // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    // const blob = await new Promise((resolve, reject) => {
    //   const xhr = new XMLHttpRequest();
    //   xhr.onload = function() {
    //     resolve(xhr.response);
    //   };
    //   xhr.onerror = function(e) {
    //     console.log(e);
    //     reject(new TypeError("Network request failed"));
    //   };
    //   xhr.responseType = "blob";
    //   xhr.open("GET", uri, true);
    //   xhr.send(null);
    // });
    // var RNFS = require("react-native-fs");

    // const file = RNFS.readFile(uri);
    // console.log(file);

    // const blob = await RNFetchBlob.fs.readStream(
    //   // file path
    //   uri,
    //   // encoding, should be one of `base64`, `utf8`, `ascii`
    //   "base64"
    //   // // (optional) buffer size, default to 4096 (4095 for BASE64 encoded data)
    //   // // when reading file in BASE64 encoding, buffer size must be multiples of 3.
    //   // 4095
    // );

    console.log(blob);

    client
      .getSpace(CONTENTFUL_SPACE_ID)
      .then(space => space.getEnvironment(CONTENTFUL_ENVIRONMENT))
      .then(environment =>
        environment.createAssetFromFiles({
          fields: {
            title: {
              "en-US": fileName
            },
            file: {
              "en-US": {
                contentType,
                fileName,
                // file: blob.stream()
                file: "test"
              }
            }
          }
        })
      )
      .then(asset => {
        console.log("prcessing...");
        return asset.processForLocale("en-US", {
          processingCheckWait: 2000
        });
      })
      .then(asset => {
        console.log("publishing...");
        return asset.publish();
      })

      .then(asset => console.log(asset))
      .catch(console.error);
  };

  selectCategory = () => {
    this.props.navigation.navigate("SelectCategory", {
      selected: this.state.category,
      setCategory: this.setCategory
    });
  };

  setCategory = item => {
    this.setState({ category: item });
  };

  setDate = newDate => {
    this.setState({ date: newDate });
  };

  takePhoto = async () => {
    if (this.camera) {
      // let ratios = await this.camera.getSupportedRatiosAsync();
      // console.log(ratios);

      // let sizes = await this.camera.getAvailablePictureSizesAsync('4:3');
      // console.log(sizes);

      let photo = await this.camera.takePictureAsync({
        quality: Platform.OS === "ios" ? 0.3 : 0.5
      });
      this.setState({ photoUpdated: true, photo });
    }
  };

  retakePhoto = () => {
    this.setState({ photo: null }, () => {
      // if (this.camera) {
      //   this.camera.resumePreview();
      // }
    });
  };

  pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      aspect: [4, 3]
    });

    // console.log(result);

    if (!result.cancelled) {
      this.setState({ photoUpdated: true, photo: result });
    }
  };

  selectDateAndroid = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        // Use `new Date()` for current date.
        // May 25 2020. Month 0 is January.
        date: this.state.date
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        // Selected year, month (0-11), day
        this.setDate(new Date(year, month, day));
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  render() {
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
            onChangeText={amount => this.setState({ amount })}
            value={this.state.amount}
          />
        </View>

        <TouchableHighlight
          onPress={this.selectCategory}
          underlayColor="lightgrey"
        >
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text
              style={{
                fontSize: 18,
                textAlign: "right"
              }}
            >
              {this.state.category} ›
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
            onChangeText={notes => this.setState({ notes })}
            value={this.state.notes}
          />
        </View>

        {Platform.OS === "ios" && (
          <DatePickerIOS
            date={this.state.date}
            onDateChange={this.setDate}
            mode="date"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "lightgrey"
            }}
          />
        )}

        {Platform.OS !== "ios" && (
          <TouchableHighlight
            onPress={() => this.selectDateAndroid("from")}
            underlayColor="lightgrey"
          >
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.label}>
                {moment(this.state.date).format("D-MMM-YY")}
              </Text>
            </View>
          </TouchableHighlight>
        )}

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              justifyContent: "flex-end"
            }}
          >
            {this.state.hasCameraPermission === null ||
              (this.state.hasCameraPermission === false && <View />)}

            {this.state.hasCameraPermission === true && !this.state.photo && (
              <Camera
                ref={ref => {
                  this.camera = ref;
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
                      <Button title="Take photo" onPress={this.takePhoto} />
                    </View>

                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={this.pickPhoto}
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

            {this.state.photo ? (
              <ImageBackground
                source={
                  this.state.photo.uri
                    ? this.state.photo
                    : { uri: this.state.photo }
                }
                style={{
                  flex: 1,
                  width: "100%",
                  justifyContent: "flex-end"
                }}
              >
                <Button title="Retake photo" onPress={this.retakePhoto} />
              </ImageBackground>
            ) : null}
          </View>
        </TouchableWithoutFeedback>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.loading}
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
  }
}

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
