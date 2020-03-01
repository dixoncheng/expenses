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
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Keyboard
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Categories from "../constants/Categories";

const {
  createClient
} = require("contentful-management/dist/contentful-management.browser.min.js");

import {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE,
  CONTENTFUL_ENVIRONMENT
} from "react-native-dotenv";

export default class AddExpense extends React.Component {
  state = {
    id: null,
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

      // TODO upload photo
      let newPhoto = {};
      if (this.state.photoUpdated) {
        newPhoto = await this.uploadImageAsync(this.state.photo.uri);
        // console.log(newPhoto);
      }

      // TODO delete existing linked image if available
      // if (this.state.photoUpdated && this.state.photoRef) {
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
            amount: { "en-US": parseFloat(this.state.amount) },
            notes: { "en-US": this.state.notes },
            date: { "en-US": this.state.date },
            category: { "en-US": this.state.category }
          };

          if (this.state.photoUpdated) {
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

          if (this.state.id) {
            // update
            return environment.getEntry(this.state.id).then(entry => {
              console.log(entry.fields);
              entry.fields = { ...entry.fields, ...fields };
              console.log(entry.fields);
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
          this.setState({ loading: false });

          this.props.navigation.state.params.refresh();

          if (this.state.id) {
            // update
            this.props.navigation.navigate("Home");
          } else {
            // create
            this.props.navigation.navigate("TabNavigator");
          }
        })
        .catch(console.error);
    } catch (error) {
      // console.log("err");
      console.log(error);
      this.setState({ loading: false });
    }
  };

  uploadImageAsync = async uri => {
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

  selectCategory = () => {
    this.props.navigation.navigate("SelectCategory", {
      selected: this.state.category,
      setCategory: this.setCategory
    });
  };

  setCategory = item => {
    this.setState({ category: item });
  };

  setDate = (event, newDate) => {
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
        // base64: true
      });
      // console.log(photo);
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

  // TODO android date picker
  // selectDateAndroid = async () => {
  //   try {
  //     const { action, year, month, day } = await DatePickerAndroid.open({
  //       // Use `new Date()` for current date.
  //       // May 25 2020. Month 0 is January.
  //       date: this.state.date
  //     });
  //     if (action !== DatePickerAndroid.dismissedAction) {
  //       // Selected year, month (0-11), day
  //       this.setDate(new Date(year, month, day));
  //     }
  //   } catch ({ code, message }) {
  //     console.warn("Cannot open date picker", message);
  //   }
  // };

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

        <DateTimePicker
          // testID="dateTimePicker"
          // timeZoneOffsetInMinutes={0}
          value={this.state.date}
          // mode={mode}
          is24Hour={true}
          display="default"
          onChange={this.setDate}
        />

        {/* {Platform.OS === "ios" && (
          <DatePickerIOS
            date={this.state.date}
            onDateChange={this.setDate}
            mode="date"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "lightgrey"
            }}
          />
        )} */}

        {/* {Platform.OS !== "ios" && (
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
        )} */}

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
