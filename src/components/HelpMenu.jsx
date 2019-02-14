import React from "react";
import DropdownSubMenu from "./DropdownSubMenu";
import { OpenInNewIcon } from "./Icons";
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
      <DropdownItem disabled>
        Help Center <OpenInNewIcon />
      </DropdownItem>
      <DropdownItem disabled>
        User Guide <OpenInNewIcon />
      </DropdownItem>
      <DropdownItem disabled>Keyboard Shortcuts</DropdownItem>
      <DropdownItem divider />
      <DropdownSubMenu direction="left">
        <DropdownToggle className="dropdown-item" caret>
          Tours
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem disabled>Overview</DropdownItem>
          <DropdownItem disabled>Query Tour</DropdownItem>
          <DropdownItem disabled>Filter Tour</DropdownItem>
        </DropdownMenu>
      </DropdownSubMenu>
    </DropdownMenu>
  </Dropdown>
);

export default HelpMenu;
