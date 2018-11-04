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
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>Chose</DropdownToggle>
    <DropdownMenu>
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
