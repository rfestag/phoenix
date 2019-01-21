import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { getColumnDefs } from "../modules/columns/Constants";
import { setSelectedEntities } from "../modules/collection/CollectionActions";
import { createSelector } from "reselect";
import _ from "lodash";
import copyToClipboard from "../utils/copyToClipboard";

const getTheme = (state, props) => state.settings.general.theme;
const getGridThemeName = createSelector([getTheme], theme => {
  return theme === "light" ? "ag-theme-balham" : "ag-theme-balham-dark";
});
const getGridThemeCss = createSelector([getTheme], theme => {
  return require(`../../node_modules/ag-grid/dist/styles/ag-theme-balham${
    theme === "light" ? "" : "-dark"
  }.css`);
});
const getData = (state, props) => props.collection.data;
const getCollectionData = createSelector([getData], collection => {
  return collection === undefined ? [] : Object.values(collection);
});
const getSelected = (state, props) => props.collection.selected || {};

export class Grid extends Component {
  static propTypes = {
    collection: PropTypes.object,
    /** Data for this grid. Each entry is a row in the grid */
    data: PropTypes.array,
    /** Column definitions for this grid */
    columns: PropTypes.array,
    /** The theme to use */
    themeName: PropTypes.string,
    themeCss: PropTypes.any,
    selected: PropTypes.object,
    onSelectionChanged: PropTypes.func
  };
  static defaultProps = {
    data: [],
    columns: []
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.skipSelectChange) {
      console.log("Skipping update");
      this.skipSelectChange = false;
      return;
    }
    if (prevProps.selected !== this.props.selected) {
      console.log("Selection state changed externally");
    }
  }

  //This requires debounce because all of the onSelectionChanged are fired, one
  //node at a time, after multiple are selected (such as with onGridReady). This
  //reduces them down to a single call that handles all of them
  onSelectionChanged = _.debounce(e => {
    if (
      this.api &&
      this.props.onSelectionChanged &&
      !this.batchUpdatingSelect
    ) {
      this.skipSelectChange = true;
      const ids = this.api.getSelectedRows().map(row => row.id);
      this.props.onSelectionChanged(this.props.collection.id, ids, true);
    }
  });
  onGridReady = params => {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.batchUpdatingSelect = true;
    this.api.forEachNode(node => {
      if (this.props.selected[node.id]) node.setSelected(true);
    });
    this.batchUpdatingSelect = false;
  };
  onKeyPress = e => {
    if (e.ctrlKey && e.key === "c") {
      let focused = this.api.getFocusedCell();
      if (focused) {
        console.log("Focused", focused);
        let row = this.api.getDisplayedRowAtIndex(focused.rowIndex);
        console.log("Row", row);
        let column = focused.column.colId;
        let value = this.api.getValue(column, row);
        copyToClipboard(value);
      }
    }
  };

  render() {
    return (
      <div
        style={{ height: "100%", width: "100%" }}
        className={this.props.themeName}
        onKeyPress={this.onKeyPress}
      >
        <AgGridReact
          // binding to array properties
          onGridReady={this.onGridReady}
          rowData={this.props.data}
          columnDefs={this.props.columns}
          deltaRowDataMode={true}
          enableSorting={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          getRowNodeId={data => data.id}
          onSelectionChanged={this.onSelectionChanged}
          suppressPropertyNamesCheck={true}
        />
      </div>
    );
  }
}
function mapStateToProps(state, props) {
  return {
    data: getCollectionData(state, props),
    selected: getSelected(state, props),
    columns: getColumnDefs(state, props),
    themeName: getGridThemeName(state, props),
    themeCss: getGridThemeCss(state, props)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onSelectionChanged: setSelectedEntities
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
