import React from 'react';
import { 
  ScrollView,
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  TouchableHighlight,
  DatePickerIOS,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Modal
} from 'react-native';

import { Camera, Permissions, ImagePicker } from 'expo';
import * as firebase from 'firebase';
import uuid from 'uuid';


export default class AddExpense extends React.Component {
  state = {
    key: null,
    date: new Date(),
    amount: null,
    category: 'Accounting',
    photo: null,
    notes: null,
    hasCameraPermission: null,
    loading: false
  };

  async componentDidMount() {
    let item = this.props.navigation.getParam('item');
    if(item) {
      item.date = new Date(item.date);
      this.setState(item);  
    }

    this.props.navigation.setParams({ save: this.save });

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });

    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      headerTitle: params.item ? 'Edit Expense' : 'Add Expense',
      headerLeft: (
        <Button
          onPress={() => params.item ? navigation.navigate('Home') : navigation.navigate('TabNavigator')}
          title={ params.item ? 'Back' : 'Cancel' }
        />
      ),
      headerRight: (
        <Button
          // onPress={navigation.getParam('save')}
          onPress={() => params.save()}
          title="Save"
        />
      ),
      // headerBackTitle: 'Cancel'
    }
  }

  save = async () => {
    // show loading spinner
    this.setState({ loading: true });
    
    // upload photo
    let photoUrl = '';
    if(this.state.photo.uri) {
      photoUrl = await this.uploadImageAsync(this.state.photo.uri);
    } else if(this.state.photo && !this.state.photo.uri) {
      photoUrl = this.state.photo;
    }
    
    // save to db
    await firebase.database().ref(this.state.key || new Date().getTime()).set({
      date: this.state.date.getTime(),
      amount: this.state.amount,
      category: this.state.category,
      notes: this.state.notes,
      photo: photoUrl || ''
    });
    
    // back to list
    this.setState({ loading: false });
    
    if(this.state.key) {
      this.props.navigation.navigate('Home');
    } else {
      this.props.navigation.navigate('TabNavigator');
    }
  }

  uploadImageAsync = async (uri) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4());
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
  }


  selectCategory = () => {
    this.props.navigation.navigate('SelectCategory', { selected: this.state.category, setCategory: this.setCategory });
  }

  setCategory = (item) => {
    this.setState({ category: item });
  }

  setDate = (newDate) => {
    this.setState({ date: newDate });
  }

  takePhoto = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      this.setState({photo});
    }
  }

  retakePhoto = () => {
    this.setState({ photo: null }, () => {
      // if (this.camera) {
      //   this.camera.resumePreview();
      // }  
    });
  }

  pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      aspect: [4, 3],
    });

    // console.log(result);

    if (!result.cancelled) {
      this.setState({ photo: result });
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
              textAlign: 'right'
            }}
            keyboardType="decimal-pad"
            placeholder="0"
            onChangeText={(amount) => this.setState({amount})}
            value={this.state.amount}
          />
        </View>
        
        <TouchableHighlight
          onPress={this.selectCategory}
          underlayColor="lightgrey" >
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text
              style={{
                fontSize: 18,
                textAlign: 'right'
              }}>
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
              textAlign: 'right'
            }}
            // keyboardType="number-pad"
            // placeholder="0"
            onChangeText={(notes) => this.setState({notes})}
            value={this.state.notes}
          />
        </View>

        <DatePickerIOS
          date={this.state.date}
          onDateChange={this.setDate}
          mode="date"
          style={{ 
            borderBottomWidth: 1,
            borderBottomColor: 'lightgrey' 
          }}
        />

        {this.state.hasCameraPermission === null || this.state.hasCameraPermission === false && <View />}

        {this.state.hasCameraPermission === true && !this.state.photo && 
        <Camera ref={ref => { this.camera = ref; }} style={{ flex: 1 }} type="back">
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'flex-end',
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingRight: 10, }}>
              <View style={{ flex: 1 }}></View>

              <View style={{ flex: 1 }}>
                <Button
                  title="Take photo"
                  onPress={this.takePhoto} />
              </View>

              <TouchableOpacity style={{ flex: 1 }}
                onPress={ this.pickPhoto }
                style={{ flex: 1 }}>
                <Text style={{ textAlign: 'right', color: 'white' }}>Gallery</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </Camera>
        }

        {this.state.photo && 
          <ImageBackground source={this.state.photo.uri ? this.state.photo: { url: this.state.photo }} style={{
            flex: 1, 
            width: '100%',
            justifyContent: 'flex-end'
          }}>
            <Button
              title="Retake photo" 
              onPress={this.retakePhoto} />
          </ImageBackground>
        }

        
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.loading}
          >
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
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
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
  }
});