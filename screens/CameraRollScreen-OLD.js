import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { MediaLibrary, Permissions } from 'expo';


export default class LinksScreen extends React.Component {

  state: {
    hasCameraRollPermission: null,
    photos: []
  };

  static navigationOptions = {
    title: 'Select image',
  };

  async componentDidMount() {
    
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraRollPermission: status === 'granted' });

    let photos = await MediaLibrary.getAssetsAsync({ mediaType: 'photo' });
    // console.log(x);
    this.setState({ photos });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        
        
        

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    // backgroundColor: '#fff',
  },
});
