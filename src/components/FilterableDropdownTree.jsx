import React from "react";
import PropTypes from "prop-types";
import FilterableTree from "./FilterableTree";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

const FilterableDropdownTree = ({ data }) => (
  <Dropdown setActiveFromChild style={{ width: "100%" }}>
    <DropdownToggle caret>Chose</DropdownToggle>
    <DropdownMenu
      left
      modifiers={{ positionFixed: true, preventOverflow: { enabled: "false" } }}
      style={{ width: 200 }}
    >
      <div style={{ height: 200 }}>
        <FilterableTree data={data} />
      </div>
    </DropdownMenu>
  </Dropdown>
);

FilterableDropdownTree.propTypes = {
  data: PropTypes.array.isRequired
};

export default FilterableDropdownTree;
