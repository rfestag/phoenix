import React from "react";
import PropTypes from "prop-types";
import FilterableTree from "./FilterableTree";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu
} from "reactstrap";

const FilterableDropdownTree = ({ data, width = 250, height = 200 }) => (
  <Dropdown setActiveFromChild style={{ width: "100%" }}>
    <DropdownToggle caret>Chose</DropdownToggle>
    <DropdownMenu
      modifiers={{ positionFixed: true, preventOverflow: { enabled: "false" } }}
    >
      <div style={{ height, width }}>
        <FilterableTree data={data} />
      </div>
    </DropdownMenu>
  </Dropdown>
);

FilterableDropdownTree.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number
};

export default FilterableDropdownTree;
