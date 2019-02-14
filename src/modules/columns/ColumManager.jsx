import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  getPropertiesForCollection,
  getGeometriesForCollection
} from "./Constants";
import { updateCollectionFields } from "../collection/CollectionActions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, ButtonGroup } from "reactstrap";
import _ from "lodash";
import PerfectScrollbar from "react-perfect-scrollbar";

import { CheckedIcon, UncheckedIcon } from "../../components/Icons";

const Checkbox = ({ selected, onClick }) => {
  return selected ? (
    <CheckedIcon onClick={onClick} />
  ) : (
    <UncheckedIcon onClick={onClick} />
  );
};
Checkbox.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

export class ColumnManager extends Component {
  static propTypes = {
    updateCollectionFields: PropTypes.func,
    collection: PropTypes.string,
    columns: PropTypes.object,
    geometries: PropTypes.object
  };
  constructor(props) {
    super(props);
    const columns = { ...props.columns };
    const geometries = { ...props.geometries };
    this.state = { columns, geometries };
  }
  componentDidUpdate(oldProps) {
    //If the collection changes, drop old state
    if (oldProps.collection !== this.props.collection) {
      let columns = { ...this.props.columns };
      let geometries = { ...this.props.geometries };
      this.setState({ columns, geometries });
    }
    //If the collection is the same, but the props/geoms changed,
    //merge the current state over the props. This should only happen
    //when new things are added, so we want to keep the current state and
    //just show the new fields
    else if (
      oldProps.columns !== this.props.columns ||
      oldProps.geometries !== this.props.geometries
    ) {
      let columns = { ...this.props.columns, ...this.state.columns };
      let geometries = { ...this.props.geometries, ...this.state.geometries };
      this.setState({ columns, geometries });
    }
  }
  toggleColumn = column => {
    const { columns } = this.state;
    const { field } = column;
    column = { ...column };
    column.hide = !column.hide;
    columns[field] = column;
    this.setState({ columns });
  };
  toggleGeometry = geom => {
    console.log("Toggle", geom);
  };
  resetColumns = () => {
    const columns = this.props.columns || {};
    const geometries = this.props.geometries || {};
    this.setState({ columns, geometries });
  };
  applyChanges = () => {
    const properties = this.state.columns;
    const geometries = this.state.geometries;
    this.props.updateCollectionFields(this.props.collection, {
      properties,
      geometries
    });
  };
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "hidden" }}>
          <PerfectScrollbar>
            <h4>Fields</h4>
            {_.chain(this.state.columns)
              .sortBy("headerName")
              .map((column, name) => {
                return (
                  <div key={name}>
                    <Checkbox
                      selected={!column.hide}
                      onClick={() => this.toggleColumn(column)}
                    />{" "}
                    {column.headerName}
                  </div>
                );
              })
              .value()}
            <h4>Geometries</h4>
            {_.chain(this.state.geometries)
              .sortBy("headerName")
              .map((geometries, name) => {
                return (
                  <div key={name}>
                    <Checkbox
                      selected={!geometries.hide}
                      onClick={() => this.toggleColumn(geometries)}
                    />{" "}
                    {geometries.headerName}
                  </div>
                );
              })
              .value()}
            {/*_.map(this.state.geometries, (geom, name) => {
              return <div key={name}><Checkbox selected={!geom.hide} onClick={() => this.toggleGeometry(geom)}/> {name}</div>;
            })*/}
          </PerfectScrollbar>
        </div>
        <ButtonGroup style={{ marginTop: "auto", display: "flex" }}>
          <Button style={{ flex: 1 }} onClick={this.resetColumns}>
            Cancel
          </Button>
          <Button style={{ flex: 1 }} onClick={this.applyChanges}>
            Apply
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const collections = state.collection.collections;
  const collection = collections[state.collection.current];
  return {
    collection: state.collection.current,
    columns: getPropertiesForCollection(state, { collection }),
    geometries: getGeometriesForCollection(state, { collection })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateCollectionFields }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ColumnManager);
