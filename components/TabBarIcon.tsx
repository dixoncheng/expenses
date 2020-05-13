import React from "react";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/Colors";

type TabBarIconProps = {
  name: string;
  focused: boolean;
};

export default function TabBarIcon({ name, focused }: TabBarIconProps) {
  return (
    <Ionicons
      name={name}
      size={26}
      style={{ marginBottom: -3 }}
      color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  );
}
