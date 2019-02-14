import React from "react";
import DropdownSubMenu from "./DropdownSubMenu";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const FilterMenu = () => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>Filter</DropdownToggle>
    <DropdownMenu>
      <DropdownItem disabled>Add Filter</DropdownItem>
      <DropdownItem disabled>Remove Filter</DropdownItem>
      <DropdownItem divider />
      <DropdownItem disabled>Clear Filters</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

export default FilterMenu;
