import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { getColumnDefs } from "../modules/columns/Constants";
import { createSelector } from "reselect";

const getData = (state, props) => props.collection.data;
const getCollectionData = createSelector([getData], collection =>
  Object.values(collection)
);

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
