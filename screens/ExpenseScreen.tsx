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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import moment from "moment";
import * as contentful from "../functions/contentful";

interface AddExpenseProps extends Navigation {
  route: any;
}

const AddExpense = ({ navigation, route }: AddExpenseProps) => {
  const { accessToken } = useSelector((state: any) => state.userReducer);

  const cameraRef = useRef<Camera>(null);
  const [item, setItem] = useState<any>(route.params?.item || {});
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);
  const [loadedPhoto, setLoadedPhoto] = useState(null);

  useLayoutEffect(() => {
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
      ),
    });
  }, [navigation, item]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasCameraPermission(status === "granted");

      // load photo
      if (item.photo) {
        const photo = await contentful.getPhoto(accessToken, item.photo);
        setLoadedPhoto(photo);
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
        newPhoto = await contentful.uploadImage(accessToken, item.photo.uri);
      }

      // TODO delete existing linked image if available
      // if (photoUpdated && photoRef) {
      // }
      await contentful.saveExpense(accessToken, item, photoUpdated, newPhoto);
      // back to list
      setLoading(false);
      navigation.navigate("Home", { refresh: true });
    } catch (error) {
      // console.log("err");
      console.log(error);
      setLoading(false);
    }
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
