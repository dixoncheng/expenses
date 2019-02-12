import React from 'react';
import { 
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  Button
} from 'react-native';

import Categories from '../constants/Categories';

export default class selectCategory extends React.Component {

  state = {
    selected: this.props.navigation.getParam('selected', null)
  }

  static navigationOptions = ({ navigation }) => {
    // const { params = {} } = navigation.state;

    return {
      headerTitle: 'Category',
      // headerBackTitle: 'Back'
      headerLeft: (
        <Button
          onPress={() => navigation.navigate('Expense')}
          title="Cancel"
        />
      ),
    }
  }

  onPress = (item) => {
    this.setState({ selected: item });
    const { params = {} } = this.props.navigation.state;
    params.setCategory(item);
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
        
        <FlatList
          data={Categories}
          renderItem={
            ({item}) => <TouchableOpacity onPress={() => this.onPress(item)}>
              <View style={styles.item}>
                <Text style={{ fontSize: 18 }}>{item}</Text>
                {this.state.selected == item && <Text>✔</Text>}
              </View>
            </TouchableOpacity>}
          keyExtractor={(item, index) => item}
          extraData={this.state}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    // paddingTop: 40,
    backgroundColor: 'white',
    // borderTopWidth: 1,
    // borderTopColor: 'grey'
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    height: 44,
  },
});
