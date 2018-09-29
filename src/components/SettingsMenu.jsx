import React from "react";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const SettingsMenu = () => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret style={{ boxShadow: "none !important" }}>
      Settings
    </DropdownToggle>
    <DropdownMenu right={true} style={{ top: -5 }}>
      <DropdownItem>Map Settings</DropdownItem>
      <DropdownItem>General Settings</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

export default SettingsMenu;
