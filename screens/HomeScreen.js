import React from 'react';
import {
  FlatList,
  Button,
  // Image,
  Platform,
  // ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  // Modal,
} from 'react-native';

import AddExpense from './AddExpense';

// import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';

export default class HomeScreen extends React.Component {
  // state = {
  //   modalVisible: false,
  // };

  componentDidMount() {
    this.props.navigation.setParams({ addExpense: () => this._addExpense(true) });
  }

  _addExpense(visible) {
    // this.setState({modalVisible: visible});
    this.props.navigation.navigate('AddExpense');
  }

  static navigationOptions = ({ navigation }) => {

    const { params = {} } = navigation.state;

    return {
      headerTitle: 'Expenses',
      headerRight: (
        <Button
          onPress={() => params.addExpense()}
          // onPress={navigation.getParam('addExpense')}
          title="Add"
        />
      ),
    }
  };

  // constructor(props) {
  //   super(props)
  //   this.state = { count: 0 }
  // }

  onPress = () => {
    // this.setState({
    //   count: this.state.count+1
    // })
    
  }

  render() {
    // const {navigate} = this.props.navigation;


    return (
      <View style={styles.container}>

        {/*<Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            >
            <AddExpense onClose={() => { this.setModalVisible(!this.state.modalVisible); }} />
            {/*<View style={{marginTop: 50}}>
              <View>
                <Text>Hello World!</Text>

                <Button
                 title="Hide Modal"
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }} />
              </View>
            </View>
          </Modal>*/}



        {/*<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/*<View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/robot-dev.png')
                  : require('../assets/images/robot-prod.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>*/}
            {/*this._maybeRenderDevelopmentModeWarning()

            <Text style={styles.getStartedText}>List of existing expenses here</Text>*/}

            <FlatList
              data={[
                {key: 'Item 1'},
                {key: 'Item 2'},
                {key: 'Item 3'},
              ]}
              renderItem={
                ({item}) => <TouchableOpacity onPress={this.onPress}>
                  <Text style={styles.item}>{item.key}</Text>
                </TouchableOpacity>}
            />


            {/*<View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
              <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Change this text and your app will automatically reload.
            </Text>
          </View>

          

          {/*<View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Button
          title="Add expense"
          // onPress={() => navigate('Profile', {name: 'Jane'})}
          onPress={() => {
            this.setModalVisible(true);
          }}
        />*/}
        
      </View>
    );
  }

  // _maybeRenderDevelopmentModeWarning() {
  //   if (__DEV__) {
  //     const learnMoreButton = (
  //       <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
  //         Learn more
  //       </Text>
  //     );

  //     return (
  //       <Text style={styles.developmentModeText}>
  //         Development mode is enabled, your app will be slower but you can use useful development
  //         tools. {learnMoreButton}
  //       </Text>
  //     );
  //   } else {
  //     return (
  //       <Text style={styles.developmentModeText}>
  //         You are not in development mode, your app will run at full speed.
  //       </Text>
  //     );
  //   }
  // }

  // _handleLearnMorePress = () => {
  //   WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  // };

  // _handleHelpPress = () => {
  //   WebBrowser.openBrowserAsync(
  //     'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
  //   );
  // };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // developmentModeText: {
  //   marginBottom: 20,
  //   color: 'rgba(0,0,0,0.4)',
  //   fontSize: 14,
  //   lineHeight: 19,
  //   textAlign: 'center',
  // },
  // contentContainer: {
  //   paddingTop: 30,
  // },
  // welcomeContainer: {
  //   alignItems: 'center',
  //   marginTop: 10,
  //   marginBottom: 20,
  // },
  // welcomeImage: {
  //   width: 100,
  //   height: 80,
  //   resizeMode: 'contain',
  //   marginTop: 3,
  //   marginLeft: -10,
  // },
  // getStartedContainer: {
  //   alignItems: 'center',
  //   marginHorizontal: 50,
  // },
  // homeScreenFilename: {
  //   marginVertical: 7,
  // },
  // codeHighlightText: {
  //   color: 'rgba(96,100,109, 0.8)',
  // },
  // codeHighlightContainer: {
  //   backgroundColor: 'rgba(0,0,0,0.05)',
  //   borderRadius: 3,
  //   paddingHorizontal: 4,
  // },
  // getStartedText: {
  //   fontSize: 17,
  //   color: 'rgba(96,100,109, 1)',
  //   lineHeight: 24,
  //   textAlign: 'center',
  // },
  // tabBarInfoContainer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: 'black',
  //       shadowOffset: { height: -3 },
  //       shadowOpacity: 0.1,
  //       shadowRadius: 3,
  //     },
  //     android: {
  //       elevation: 20,
  //     },
  //   }),
  //   alignItems: 'center',
  //   backgroundColor: '#fbfbfb',
  //   paddingVertical: 20,
  // },
  // tabBarInfoText: {
  //   fontSize: 17,
  //   color: 'rgba(96,100,109, 1)',
  //   textAlign: 'center',
  // },
  // navigationFilename: {
  //   marginTop: 5,
  // },
  // helpContainer: {
  //   marginTop: 15,
  //   alignItems: 'center',
  // },
  // helpLink: {
  //   paddingVertical: 15,
  // },
  // helpLinkText: {
  //   fontSize: 14,
  //   color: '#2e78b7',
  // },

  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },

});
