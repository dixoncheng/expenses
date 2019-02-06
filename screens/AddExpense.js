import React from 'react';
import { 
  ScrollView,
  StyleSheet,
  Text,
  Button,
  View,
  TextInput,
  Picker,
  TouchableOpacity
} from 'react-native';

export default class AddExpense extends React.Component {
  state = {
    date: null,
    amount: null,
    category: null,
    image: null
  };

  componentDidMount() {
    this.props.navigation.setParams({ save: () => alert('saved') });
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      headerTitle: 'Add Expenses',
      headerRight: (
        <Button
          // onPress={navigation.getParam('save')}
          onPress={() => params.save()}
          title="Save"
        />
      ),
      headerBackTitle: 'Cancel'
    }
  };


  selectCategory = () => {

  }

  render() {
    return (
      <View style={styles.container}>

        {/*<View style={{
          // flex: 1,
          flexDirection: 'row',
          // justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: 'grey'
        }}>
          <Button
            style={{ flex: 1, borderWidth: 1 }}
            title="Cancel"
            onPress={this.props.onClose} />

          <Text style={{ flex: 1,
            textAlign: 'center',
            fontSize: 17,
            // fontWeight: 'bold' 
            }}
          >
            Add Expense
          </Text>

          <Button
            style={{ flex: 1, borderWidth: 1 }}
            title="Save"
            onPress={this.props.onClose} />
        </View>*/}

        <ScrollView style={{ flex: 1 }}>
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
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={this.selectCategory}>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'right'
                }}>
                Select >
              </Text>
            </TouchableOpacity>
          </View>


          {/*<Picker
  selectedValue={this.state.language}
  style={{height: 50, width: 100}}
  onValueChange={(itemValue, itemIndex) =>
    this.setState({language: itemValue})
  }>
  <Picker.Item label="Java" value="java" />
  <Picker.Item label="JavaScript" value="js" />
</Picker>*/}



            {/*Date

            Category

            Camera */}

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    // paddingTop: 40,
    backgroundColor: '#fff',
    // borderTopWidth: 1,
    // borderTopColor: 'grey'
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
  }
});
