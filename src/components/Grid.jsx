import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { getColumnDefs } from "../modules/columns/Constants";
import { setSelectedEntities } from "../modules/collection/CollectionActions";
import { createSelector } from "reselect";
import _ from "lodash";

const getData = (state, props) => props.collection.data;
const getCollectionData = createSelector([getData], collection => {
  console.log("Getting values for", collection);
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
    theme: PropTypes.string,
    selected: PropTypes.object,
    onSelectionChanged: PropTypes.func
  };
  static defaultProps = {
    data: [],
    columns: [],
    theme: "ag-theme-balham-dark"
  };
  componentDidMount() {
    console.log("Mounted grid");
  }

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
      this.props.onSelectionChanged(this.props.collection.id, ids);
    }
  });
  onGridReady = params => {
    console.log("Grid ready");
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.batchUpdatingSelect = true;
    this.api.forEachNode(node => {
      if (this.props.selected[node.id]) node.setSelected(true);
    });
    this.batchUpdatingSelect = false;
  };

  render() {
    return (
      <div
        style={{ height: "100%", width: "100%" }}
        className={this.props.theme}
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
    columns: getColumnDefs(state, props)
    //TODO: theme
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
