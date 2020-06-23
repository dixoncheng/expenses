import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  Button,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
  AsyncStorage,
  Image,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import XLSX from "xlsx";
import { useSafeArea } from "react-native-safe-area-context";
import Colors from "../constants/Colors";
import Categories from "../constants/Categories";
import contentful from "../constants/contentful";
import { Navigation } from "../types";
import Theme from "../constants/Theme";

const {
  createClient,
} = require("contentful-management/dist/contentful-management.browser.min.js");

interface ReportsScreenProps extends Navigation {
  route: any;
}

const ReportsScreen = ({ navigation, route }: ReportsScreenProps) => {
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showingModal, setShowingModal] = useState(false);

  const insets = useSafeArea();
  const win = Dimensions.get("window");
  const headerHeight = (203 * win.width) / 750;

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerStyle: {
  //       height: 140,
  //     },
  //     headerTitle: (
  //       <Image
  //         source={require("../assets/images/Report-Header.png")}
  //         style={{
  //           width: 380,
  //           height: 99,
  //           resizeMode: "contain",
  //         }}
  //       />
  //     ),
  //   });
  // }, [navigation]);

  useEffect(() => {
    selectDateFrom(null, new Date());
    selectDateTo(null, new Date());
  }, []);

  const selectDateFrom = (event: any, newDate: Date) => {
    if (newDate) {
      newDate.setHours(0, 0, 0);
      setShowDateFrom(false);
      setDateFrom(newDate);
    }
  };

  const selectDateTo = (event: any, newDate: Date) => {
    if (newDate) {
      // set to last second on the day so the expenses from that day are included
      newDate.setHours(23, 59, 59);
      setShowDateTo(false);
      setDateTo(newDate);
    }
  };

  const onGenerate = async () => {
    setShowingModal(true);
    setLoading(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
    const client = createClient({
      accessToken,
    });
    const result = await client
      .getSpace(contentful.spaceId)
      .then((space: any) => space.getEnvironment(contentful.env))
      .then((environment: any) =>
        environment
          .getEntries({
            content_type: contentful.contentType,
            select:
              "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
            "fields.date[gte]": moment(dateFrom).format(),
            "fields.date[lte]": moment(dateTo).format(),
            order: "-fields.date",
          })
          .then((response: any) => response)
          .catch(function (error: any) {
            console.log(error);
          })
      );

    // console.log(result);
    if (result.total) {
      let arr = result.items.map(
        ({ fields: { date, amount, category, notes } }) => {
          return {
            date: date && new Date(date["en-US"]),
            amount: amount && amount["en-US"] + "",
            category: category && category["en-US"],
            notes: notes && notes["en-US"],
          };
        }
      );

      // generate csv
      const report = generateReport(arr);
      const filename = `${FileSystem.documentDirectory}Expenses-${moment(
        dateFrom
      ).format("MMM-YY")}-${moment(dateTo).format("MMM-YY")}.xlsx`;

      await FileSystem.writeAsStringAsync(filename, report, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setLoading(false);
      setShowingModal(false);

      MailComposer.composeAsync({
        recipients: ["dixontk@gmail.com"],
        subject: `Expense report ${moment(dateFrom).format(
          "MMM YY"
        )} - ${moment(dateTo).format("MMM YY")}`,
        attachments: [filename],
      });
    } else {
      setShowingModal(false);
      setLoading(false);

      setTimeout(() => {
        Alert.alert("No records found");
      }, 500);
    }
  };

  const generateReport = (arr: ReadonlyArray<any>) => {
    let sheetHeadingsCounters = [];
    let data = [];
    let fmt = "$0.00";
    for (let i = 0; i < arr.length; i++) {
      let c: any = sheetHeadingsCounters[arr[i].category] + 1 || 0;
      let cell = {
        v: parseFloat(arr[i].amount || 0),
        z: fmt,
        c: arr[i].notes ? [{ t: arr[i].notes }] : null,
        t: "n",
      };
      if (cell.c) {
        cell.c.hidden = true;
      }

      // if row exists and nothing in the category cell
      if (data[c] && !data[c][arr[i].category]) {
        data[c][arr[i].category] = cell;
      } else {
        // if(data[c]) {
        //   console.log(data[c][arr[i].category]);
        // }

        let row = {};
        row[arr[i].category] = cell;
        data.push(row);
      }

      sheetHeadingsCounters[arr[i].category] = c;
    }

    // add empty row to separate totals
    data.push({ " ": "" });

    // add totals row
    let row = {};
    for (let i = 0; i < Categories.length; i++) {
      row[Categories[i]] = {
        f: `SUM(${XLSX.utils.encode_cell({
          r: 1,
          c: i,
        })}:${XLSX.utils.encode_cell({ r: data.length, c: i })})`,
        z: fmt,
        t: "n",
      };
    }
    data.push(row);
    // console.log(data);

    const ws = XLSX.utils.json_to_sheet(data, { header: Categories });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* write file */
    // const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});
    // const file = DDP + "sheetjsw.xlsx";
    // writeFile(file, output(wbout), 'ascii').then((res) =>{
    //     // Alert.alert("exportFile success", "Exported to " + file);
    // }).catch((err) => { console.log("exportFile Error", "Error " + err.message); });

    // XLSX.writeFile(wb, 'test.xlsx');
    return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: "white", paddingTop: insets.top }}>
        <Image
          source={require("../assets/images/Report-Header.png")}
          style={{
            width: "100%",
            height: headerHeight,
            resizeMode: "contain",
          }}
        />
      </View>
      {Platform.OS === "ios" && (
        <View>
          <Text style={styles.label}>From</Text>
          <DateTimePicker
            value={dateFrom}
            is24Hour={true}
            display="default"
            onChange={selectDateFrom}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "lightgrey",
            }}
          />
          <Text style={styles.label}>To</Text>
          <DateTimePicker
            value={dateTo}
            is24Hour={true}
            display="default"
            onChange={selectDateTo}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "lightgrey",
            }}
          />
        </View>
      )}

      {Platform.OS !== "ios" && (
        <View>
          <TouchableHighlight
            onPress={() => setShowDateFrom(true)}
            underlayColor="lightgrey"
          >
            <View style={styles.row}>
              <Text style={styles.label}>Date from</Text>
              <Text style={styles.label}>
                {moment(dateFrom).format("D-MMM-YY")}
              </Text>
            </View>
          </TouchableHighlight>

          {showDateFrom && (
            <DateTimePicker
              value={dateFrom}
              is24Hour={true}
              display="default"
              onChange={selectDateFrom}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "lightgrey",
              }}
            />
          )}

          <TouchableHighlight
            onPress={() => setShowDateTo(true)}
            underlayColor="lightgrey"
          >
            <View style={styles.row}>
              <Text style={styles.label}>Date to</Text>
              <Text style={styles.label}>
                {moment(dateTo).format("D-MMM-YY")}
              </Text>
            </View>
          </TouchableHighlight>

          {showDateTo && (
            <DateTimePicker
              value={dateTo}
              is24Hour={true}
              display="default"
              onChange={selectDateTo}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "lightgrey",
              }}
            />
          )}
        </View>
      )}

      {/* <Button title="Generate" onPress={onGenerate} /> */}
      <TouchableOpacity onPress={onGenerate}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Get Report</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showingModal}
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
          {loading && <ActivityIndicator color="#fff" animating size="large" />}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  row: {
    // flex: 1,
    width: "100%",
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    justifyContent: "space-between",
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    textAlign: "center",
    fontFamily: Theme.fontFamily,
    color: Colors.tintColor,
  },
  button: {
    padding: 15,
    backgroundColor: Colors.tintColor,
  },
  buttonText: {
    fontFamily: Theme.fontFamily,
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
});

export default ReportsScreen;
