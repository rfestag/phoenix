import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import {
  getPropertiesForCollection,
  getColumnDefs
} from "../modules/columns/Constants";
import {
  setSelectedEntities,
  setFocusedEntity,
  updateCollectionFields
} from "../modules/collection/CollectionActions";
import { createSelector } from "reselect";
import { emitTimingMetric } from "../modules/metrics/MetricsActions";
import _ from "lodash";
import copyToClipboard from "../utils/copyToClipboard";

const getTheme = (state, props) => state.settings.general.theme;
const getGridThemeName = createSelector([getTheme], theme => {
  return theme === "light" ? "ag-theme-balham" : "ag-theme-balham-dark";
});
const getGridThemeCss = createSelector([getTheme], theme => {
  return require(`../../node_modules/ag-grid-community/dist/styles/ag-theme-balham${
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
    properties: PropTypes.object,
    /** The theme to use */
    themeName: PropTypes.string,
    defaultColDef: PropTypes.object,
    themeCss: PropTypes.any,
    selected: PropTypes.object,
    emitTimingMetric: PropTypes.func,
    onSelectionChanged: PropTypes.func,
    onRowFocusChanged: PropTypes.func,
    updateCollectionFields: PropTypes.func
  };
  static defaultProps = {
    defaultColDef: { sortable: true, resizable: true },
    data: [],
    columns: []
  };

  constructor(props) {
    super(props);
    this.lastRender = 0;
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
      this.props.onSelectionChanged(this.props.collection.id, ids, true);
    }
  });
  onGridReady = params => {
    this.focused = undefined;
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.batchUpdatingSelect = true;
    this.api.setRowData(this.props.data);
    this.api.forEachNode(node => {
      if (this.props.selected[node.id]) node.setSelected(true);
    });
    this.batchUpdatingSelect = false;
  };
  onCellFocused = _.throttle(e => {
    if (!this.api) return;
    let focused = this.api.getFocusedCell();
    if (focused) {
      let row = this.api.getDisplayedRowAtIndex(focused.rowIndex);
      if (row !== this.focused) {
        this.focused = row;
        this.props.onRowFocusChanged(row.data.id);
      }
    }
  }, 100);
  onKeyPress = e => {
    if (!this.api) return;
    if (e.ctrlKey && e.key === "c") {
      let focused = this.api.getFocusedCell();
      if (focused) {
        let row = this.api.getDisplayedRowAtIndex(focused.rowIndex);
        let column = focused.column.colId;
        let value = this.api.getValue(column, row);
        copyToClipboard(value);
      }
    }
  };
  onSortChanged = e => {
    let sortedColumns = this.api.sortController.getColumnsWithSortingOrdered();
    let columns = this.api.columnController.getAllGridColumns();
    let properties = { ...this.props.properties };
    //First, clear all sorting fields.
    _.each(columns, column => {
      let field = column.colDef.field;
      let prop = { ...properties[field] };
      prop.sort = undefined;
      prop.sortedAt = undefined;
      properties[field] = prop;
    });
    //Then, replace any sorting related fields (sort and sortedAt)
    _.each(sortedColumns, (column, i) => {
      let field = column.colDef.field;
      let prop = properties[field];
      prop.sort = column.sort;
      prop.sortedAt = column.sortedAt;
    });
    this.props.updateCollectionFields(this.props.collection.id, { properties });
  };
  onColumnMoved = e => {
    let columns = this.api.columnController.getAllGridColumns();
    let properties = { ...this.props.properties };
    let i = 0;
    _.each(columns, column => {
      let field = column.colDef.field;
      let prop = _.find(properties, p => p.field === column.colDef.field);
      if (!prop) return;
      prop = { ...properties[field] };
      prop.position = i++;
      properties[field] = prop;
    });
    this.props.updateCollectionFields(this.props.collection.id, { properties });
  };
  onColumnResized = _.debounce(e => {
    let { column } = e;
    let { field } = column.colDef;
    let properties = { ...this.props.properties };
    let prop = _.find(properties, p => p.field === field);
    properties[field] = { ...prop };
    properties[field].width = column.actualWidth;
    this.props.updateCollectionFields(this.props.collection.id, { properties });
  }, 200);

  render() {
    //I found that using delta mode was a little slow (often over 100ms), and
    //it doesn't deal with the new mutable nature of the collection. This
    //appears to perform better, and handles mutable entities
    if (this.api) {
      let transaction = { update: [], add: [], remove: [] };
      let keys = new Map();
      let count = 0;
      this.batchUpdatingSelect = true;

      let focused = this.api.getFocusedCell();
      let focusedId = undefined;
      let focusedField = undefined;
      if (focused) {
        let row = this.api.getDisplayedRowAtIndex(focused.rowIndex);
        focusedField = focused.column.colDef.field;
        focusedId = row.data.id;
      }

      //Start by manually setting everything as selected.
      //While it may technically be more correct select after
      //the update (to ensure any new entities that somehow may
      //have been selected are marked), that case should be
      //rare or non-existent. This avoids multiple iterations
      //over the data.
      this.api.forEachNode((node, index) => {
        count += 1;
        keys.set(node.id, true);
        //keys[node.id] = true;
        node.setSelected(Boolean(this.props.selected[node.id]));
      });
      this.batchUpdatingSelect = false;

      //If the grid has no data, initialize it by adding the collection
      //data directly.
      if (count === 0) {
        transaction = { add: this.props.data };
      }
      //Otherwise, check to see if we already have it. Determine
      //add vs update based on that.
      else {
        transaction = this.props.data.reduce((transaction, entity) => {
          //delete keys[entity.id];
          keys.delete(entity.id);
          //try {
          if (
            this.lastRender < entity.createTime &&
            !this.api.getRowNode(entity.id)
          )
            transaction.add.push(entity);
          else if (this.lastRender < entity.updateTime)
            transaction.update.push(entity);
          //if (!this.api.getRowNode(entity.id)) transaction.add.push(entity);
          //else transaction.update.push(entity);
          //} catch (e) {
          //  transaction.update.push(entity);
          //}
          return transaction;
        }, transaction);
        //Finally, remove any keys we didn't either add or update.
        //These will be associated with entities that have aged off
        //or been deleted
        for (let [id] of keys) {
          transaction.remove.push({ id });
        }
        //transaction.remove = Object.keys(keys).map(id => ({ id }));
      }
      //We explicitly do the synchronous update vs. async. The async
      //logic adds unnecessary overhead, taking 50-100ms longer.
      this.api.updateRowData(transaction);

      if (focusedId) {
        let targetRow = this.api.getRowNode(focusedId);
        if (targetRow) {
          this.api.setFocusedCell(targetRow.rowIndex, focusedField);
        }
      }
    }
    this.lastRender = Date.now();
    return (
      <div
        style={{ height: "100%", width: "100%" }}
        className={this.props.themeName}
        onKeyPress={this.onKeyPress}
      >
        <AgGridReact
          onGridReady={this.onGridReady}
          columnDefs={this.props.columns}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          suppressDragLeaveHidesColumns={true}
          getRowNodeId={data => data.id}
          onSelectionChanged={this.onSelectionChanged}
          onSortChanged={this.onSortChanged}
          onColumnMoved={this.onColumnMoved}
          onColumnResized={this.onColumnResized}
          onCellFocused={this.onCellFocused}
          suppressPropertyNamesCheck={true}
          defaultColDef={this.props.defaultColDef}
        />
      </div>
    );
  }
}
function mapStateToProps(state, props) {
  return {
    data: getCollectionData(state, props),
    selected: getSelected(state, props),
    properties: getPropertiesForCollection(state, props),
    columns: getColumnDefs(state, props),
    themeName: getGridThemeName(state, props),
    themeCss: getGridThemeCss(state, props)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      emitTimingMetric,
      onSelectionChanged: setSelectedEntities,
      onRowFocusChanged: setFocusedEntity,
      updateCollectionFields
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
