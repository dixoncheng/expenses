import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  Button,
  ActivityIndicator,
  Modal,
  TouchableHighlight,
  Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import XLSX from "xlsx";

import Categories from "../constants/Categories";

import {
  CONTENTFUL_DELIVERY_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_CONTENT_TYPE
} from "react-native-dotenv";

const { createClient } = require("contentful/dist/contentful.browser.min.js");

const ReportsScreen = () => {
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showingModal, setShowingModal] = useState(false);

  useEffect(() => {
    selectDateFrom(null, new Date());
    selectDateTo(null, new Date());
  }, []);

  const selectDateFrom = (event, newDate) => {
    if (newDate) {
      newDate.setHours(0, 0, 0);
      setDateFrom(newDate);
      setShowDateFrom(false);
    }
  };

  const selectDateTo = (event, newDate) => {
    if (newDate) {
      // set to last second on the day so the expenses from that day are included
      newDate.setHours(23, 59, 59);
      setDateTo(newDate);
      setShowDateTo(false);
    }
  };

  const onGenerate = async () => {
    setShowingModal(true);
    setLoading(true);
    const client = createClient({
      accessToken: CONTENTFUL_DELIVERY_TOKEN,
      space: CONTENTFUL_SPACE_ID
    });
    const result = await client
      .getEntries({
        content_type: CONTENTFUL_CONTENT_TYPE,
        select:
          "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
        "fields.date[gte]": moment(dateFrom).format(),
        "fields.date[lte]": moment(dateTo).format(),
        order: "-fields.date"
      })
      .then(response => response)
      .catch(function(error) {
        console.log(error);
      });

    if (result.total) {
      let arr = result.items.map(item => {
        const { amount, category, date, notes } = item.fields;
        return { amount, category, date, notes };
      });

      // generate csv
      const report = this.generateReport(arr);
      const filename = `${FileSystem.documentDirectory}Expenses-${moment(
        dateFrom
      ).format("MMM-YY")}-${moment(dateTo).format("MMM-YY")}.xlsx`;

      await FileSystem.writeAsStringAsync(filename, report, {
        encoding: FileSystem.EncodingType.Base64
      });

      setLoading(false);
      setShowingModal(false);

      MailComposer.composeAsync({
        recipients: ["dixontk@gmail.com"],
        subject: `Expense report ${moment(dateFrom).format(
          "MMM YY"
        )} - ${moment(dateTo).format("MMM YY")}`,
        attachments: [filename]
      });
    } else {
      setShowingModal(false);
      setLoading(false);

      setTimeout(() => {
        Alert.alert("No records found");
      }, 500);
    }
  };

  generateReport = arr => {
    let sheetHeadingsCounters = [];
    let data = [];
    let fmt = "$0.00";
    for (let i = 0; i < arr.length; i++) {
      let c = sheetHeadingsCounters[arr[i].category] + 1 || 0;
      let cell = {
        v: parseFloat(arr[i].amount || 0),
        z: fmt,
        c: arr[i].notes ? [{ t: arr[i].notes }] : null,
        t: "n"
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
          c: i
        })}:${XLSX.utils.encode_cell({ r: data.length, c: i })})`,
        z: fmt,
        t: "n"
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
              borderBottomColor: "lightgrey"
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
              borderBottomColor: "lightgrey"
            }}
          />
        </View>
      )}

      {Platform.OS !== "ios" && (
        <View>
          <TouchableHighlight
            onPress={() => setShowingModal(true)}
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
                borderBottomColor: "lightgrey"
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
                borderBottomColor: "lightgrey"
              }}
            />
          )}
        </View>
      )}

      <Button title="Generate" onPress={onGenerate} />

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
              justifyContent: "center"
            }
          ]}
        >
          {loading && <ActivityIndicator color="#fff" animating size="large" />}
        </View>
      </Modal>
    </View>
  );
};

ReportsScreen["navigationOptions"] = () => ({
  title: "Reports"
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  row: {
    // flex: 1,
    width: "100%",
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    justifyContent: "space-between"
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    textAlign: "center"
  }
});

export default ReportsScreen;
