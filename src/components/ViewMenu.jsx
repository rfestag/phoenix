import React from "react";
import DropdownSubMenu from "./DropdownSubMenu";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const ViewMenu = () => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>View</DropdownToggle>
    <DropdownMenu>
      <DropdownItem>Something</DropdownItem>
      <DropdownItem>Another</DropdownItem>
      <DropdownItem divider />
      <DropdownSubMenu direction="right">
        <DropdownToggle className="dropdown-item" caret>
          SubMenu
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>1</DropdownItem>
          <DropdownItem>2</DropdownItem>
          <DropdownItem>3</DropdownItem>
        </DropdownMenu>
      </DropdownSubMenu>
    </DropdownMenu>
  </Dropdown>
);

export default ViewMenu;
