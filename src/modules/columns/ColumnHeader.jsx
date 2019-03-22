import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import DropdownSubMenu from "../../components/DropdownSubMenu";
import { SortAscending, SortDescending } from "../../components/Icons";

const ColumnMenu = ({ column, displayName }) => (
  <Dropdown style={{ display: "flex" }}>
    <DropdownToggle
      color="header-dropdown"
      style={{ padding: "0 5px 0 0", transition: "none" }}
      caret
    />
    <DropdownMenu
      right
      modifiers={{ preventOverflow: { boundariesElement: "window" } }}
      positionFixed={true}
    >
      <DropdownItem>Configure...</DropdownItem>
      <DropdownItem>Color By...</DropdownItem>
      <DropdownItem>Configure Color...</DropdownItem>
      <DropdownItem divider />
      <DropdownItem>Copy All</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
ColumnMenu.propTypes = {
  displayName: PropTypes.string,
  column: PropTypes.object
};

export default class CustomHeader extends Component {
  static propTypes = {
    column: PropTypes.object,
    api: PropTypes.object,
    displayName: PropTypes.string,
    setSort: PropTypes.func
  };
  render() {
    let { column } = this.props;
    let { sort } = column;
    let SortIcon = undefined;

    let sortedColumns = this.props.api.sortController.getColumnsWithSortingOrdered();
    let index = sortedColumns.findIndex(c => c === column);

    if (sort === "asc") SortIcon = SortAscending;
    else if (sort === "desc") SortIcon = SortDescending;

    return (
      <div style={{ display: "flex" }}>
        <div
          onClick={this.onSortRequested}
          style={{ display: "flex", flex: 1 }}
        >
          <div>{this.props.displayName}</div>
          <div style={{ paddingLeft: 8, flex: 1 }}>
            {sortedColumns.length > 1 && index >= 0 && index + 1}
            {SortIcon && <SortIcon />}
          </div>
        </div>
        <ColumnMenu displayName={this.props.displayName} column={column} />
      </div>
    );
  }

  onSortRequested = event => {
    let sort = this.props.column.sort;

    if (!sort) sort = "asc";
    else if (sort === "asc") sort = "desc";
    else sort = undefined;

    this.props.setSort(sort, event.shiftKey);
  };
}
