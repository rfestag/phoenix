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
    <DropdownMenu right={true}>
      <DropdownItem>Map Settings</DropdownItem>
      <DropdownItem>General Settings</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

export default SettingsMenu;
