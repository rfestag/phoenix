import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { createSelector } from "reselect";

const getData = (state, props) => props.collection.data;
const getCollectionData = createSelector([getData], collection =>
  Object.values(collection)
);

const getColumns = (state, props) => {
  //TODO: Get these from some redux state
  return [
    {
      checkboxSelection: true,
      pinned: true,
      suppressMenu: true,
      headerCheckboxSelection: true,
      width: 40,
      suppressResize: true,
      suppressSizeToFit: true
    },
    { headerName: "ID", field: "id" },
    {
      headerName: "Latitude",
      field: "Lat",
      //enableCellChangeFlash: true,
      cellRendererFramework: ValueRenderer,
      valueGetter: latestValueGetter
    },
    {
      headerName: "Longitude",
      field: "Long",
      //enableCellChangeFlash: true,
      cellRendererFramework: ValueRenderer,
      valueGetter: latestValueGetter
    },
    {
      headerName: "Altitude",
      field: "Alt",
      //enableCellChangeFlash: true,
      cellRendererFramework: ValueRenderer,
      valueGetter: latestValueGetter
    },
    {
      headerName: "First seen",
      field: "start",
      valueFormatter: timeFormatter,
      cellRendererFramework: ValueRenderer,
      //enableCellChangeFlash: true,
      valueGetter: timeGetter
    },
    {
      headerName: "Last seen",
      field: "end",
      valueFormatter: timeFormatter,
      cellRendererFramework: ValueRenderer,
      //enableCellChangeFlash: true,
      valueGetter: timeGetter
    }
  ];
};
const getColumnDefs = createSelector([getColumns], columns => {
  //TODO: We need to map the columns into Ag-grid format. Right now, the sample is already in that
  //format, but we want the redux state to be purely stateful (the above includes functions for
  //the formatters and getters, which we don't actually want in redux)
  return columns;
});

function latestValueGetter(params) {
  if (params.data.properties[params.colDef.field] === undefined)
    return undefined;
  return params.data.properties[params.colDef.field].last;
  //const values = params.data.properties[params.colDef.field].data;
  //return values === undefined ? undefined : values[values.length - 1];
}
function timeGetter(params) {
  return params.data.when[params.colDef.field];
}
function timeFormatter(params) {
  if (params === undefined || params.value === undefined) return undefined;
  return moment(params.value)
    .utc()
    .format();
}
class ValueRenderer extends React.Component {
  static propTypes = {
    colDef: PropTypes.object,
    value: PropTypes.any
  };
  render() {
    // or access props using 'this'
    const formatter = this.props.colDef.valueFormatter;
    const value = formatter ? formatter(this.props) : this.props.value;
    return <span>{value}</span>;
  }
}
export class Grid extends Component {
  static propTypes = {
    /** Data for this grid. Each entry is a row in the grid */
    data: PropTypes.array,
    /** Column definitions for this grid */
    columns: PropTypes.array,
    /** The theme to use */
    theme: PropTypes.string
  };
  static defaultProps = {
    data: [],
    columns: [],
    theme: "ag-theme-balham-dark"
  };

  render() {
    return (
      <div
        style={{ height: "100%", width: "100%" }}
        className={this.props.theme}
      >
        <AgGridReact
          // binding to array properties
          rowData={this.props.data}
          columnDefs={this.props.columns}
          deltaRowDataMode={true}
          enableSorting={true}
          getRowNodeId={data => data.id}
        />
      </div>
    );
  }
}
function mapStateToProps(state, props) {
  return {
    data: getCollectionData(state, props),
    columns: getColumnDefs(state, props)
    //TODO: theme
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
