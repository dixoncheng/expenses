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
  SafeAreaView
} from 'react-native';

import { Camera, Permissions, ImagePicker } from 'expo';

export default class AddExpense extends React.Component {
  state = {
    date: new Date(),
    amount: null,
    category: 'Accounting',
    photo: null,
    hasCameraPermission: null
  };

  async componentDidMount() {
    this.props.navigation.setParams({ save: () => alert('saved') });

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });

    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      headerTitle: 'Add Expense',
      headerLeft: (
        <Button
          onPress={() => navigation.navigate('TabNavigator')}
          title="Cancel"
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

        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={{
                fontSize: 18,
                flex: 1,
                textAlign: 'right'
              }}
              keyboardType="number-pad"
              placeholder="0"
              onChangeText={(amount) => this.setState({amount})}
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
            <ImageBackground source={this.state.photo} style={{
              flex: 1, 
              width: '100%',
              justifyContent: 'flex-end'
            }}>
              <Button
                title="Retake photo" 
                onPress={this.retakePhoto} />
            </ImageBackground>
          }

        </View>

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
