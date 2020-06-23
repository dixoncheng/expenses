import { Platform } from "react-native";

export default {
  fontFamily: Platform.OS === "ios" ? "Futura" : "Roboto",
};
