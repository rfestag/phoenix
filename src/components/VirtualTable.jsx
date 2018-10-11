import "react-virtualized/styles.css";
import React, { Component } from "react";
import { Table, SortDirection } from "react-virtualized";
import { createSelector } from "reselect";
import _ from "lodash";

//Use list selector to memoize sorted list state.
const getList = (state, props) => props.list;
const getDirection = (state, props) => state.sortDirection;
const getSortBy = (state, props) => state.sortBy;
const list = createSelector(
  [getList, getDirection, getSortBy],
  (list, sortDirection, sortBy) => {
    const chain = _.chain(list).orderBy(sortBy);
    if (sortDirection === SortDirection.DESC) return chain.reverse().value();
    else return chain.value();
  }
);
export default class VirtualTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  orderedList() {
    return list(this.state, this.props);
  }

  render() {
    const { sortBy, sortDirection } = this.state;
    return (
      <Table
        {...this.props}
        rowGetter={({ index }) => this.orderedList()[index]}
        rowCount={this.orderedList().length}
        sort={this._sort}
        sortBy={sortBy}
        sortDirection={sortDirection}
      >
        {this.props.children}
      </Table>
    );
  }

  _sort = ({ sortBy, sortDirection }) => {
    const { sortDirection: prevSortDirection } = this.state;

    // If list was sorted DESC by this column.
    // Rather than switch to ASC, return to "natural" order.
    if (prevSortDirection === SortDirection.DESC) {
      sortBy = null;
      sortDirection = null;
    }

    this.setState({ sortBy, sortDirection });
  };
}
