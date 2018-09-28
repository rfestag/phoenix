import React from "react";
import DropdownSubMenu from "./DropdownSubMenu";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const HelpMenu = () => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>Help</DropdownToggle>
    <DropdownMenu right={true}>
      <DropdownItem>Something</DropdownItem>
      <DropdownItem>Another</DropdownItem>
      <DropdownItem divider />
      <DropdownSubMenu direction="left">
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

export default HelpMenu;
