import React from "react";
import PropTypes from "prop-types";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const TabMenu = ({ children, active }) => (
  <Dropdown>
    {children}
    <DropdownToggle
      color={active ? "accent" : "secondary"}
      style={{ padding: "0 5px 0 0" }}
      caret
    />
    <DropdownMenu right>
      <DropdownItem>Manage...</DropdownItem>
      <DropdownItem divider />
      <DropdownItem>Pause</DropdownItem>
      <DropdownItem>Cancel</DropdownItem>
      <DropdownItem>Delete</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

TabMenu.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.any
};

export default TabMenu;
