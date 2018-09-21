import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  getPropertiesForCollection,
  getGeometriesForCollection
} from "./Constants";
import { updateCollectionFields } from "../collection/CollectionActions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import _ from "lodash";

export class ColumnManager extends React.Component {
  static propTypes = {
    columns: PropTypes.object,
    geometries: PropTypes.object
  };
  render() {
    return (
      <div>
        {_.map(this.props.columns, (column, name) => {
          return <div key={name}>{column.headerName}</div>;
        })}
        {_.map(this.props.geometries, (column, name) => {
          return <div key={name}>{name}</div>;
        })}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const collections = state.collection.collections;
  const collection = collections[state.collection.current];
  return {
    columns: getPropertiesForCollection(state, { collection }),
    geometries: getGeometriesForCollection(state, { collection })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ColumnManager);
