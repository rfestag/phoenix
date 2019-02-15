import React from "react";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const EnrichMenu = () => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>Enrich</DropdownToggle>
    <DropdownMenu>
      <DropdownItem disabled>Manage Enrichments</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

export default EnrichMenu;
