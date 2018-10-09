import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import { RIGHT_PANEL, collapsePanel } from "../panel/PanelActions";
import {
  setBaselayer,
  addBaselayer,
  removeBaselayer,
  showOverlay,
  hideOverlay,
  addOverlay,
  removeOverlay
} from "./MapActions";
import { AutoSizer, List } from "react-virtualized";
import { Collapse, ListGroup, ListGroupItem } from "reactstrap";
import {
  CollapseHeader,
  SwitchableCollapse
} from "../../components/SwitchableCollapse";

export class LayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: this.props.layers.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        else return 0;
      })
    };
    console.log("State", this.state);
  }
  static propTypes = {
    layers: PropTypes.array,
    open: PropTypes.bool,
    onHeaderClick: PropTypes.func,
    name: PropTypes.string
  };
  renderRow = ({ key, index, style }) => (
    <ListGroupItem key={key} style={style}>
      {this.state.layers[index].name}
    </ListGroupItem>
  );
  render() {
    return (
      <div
        style={{
          display: "flex",
          flex: this.props.open ? 1 : 0,
          flexDirection: "column"
        }}
      >
        <CollapseHeader
          active={this.props.open}
          onClick={this.props.onHeaderClick}
        >
          {this.props.name}
        </CollapseHeader>
        <Collapse
          isOpen={this.props.open}
          style={{ flex: this.props.open ? 1 : 0 }}
        >
          <ListGroup style={{ height: "100%" }}>
            <AutoSizer tyle={{ height: "100%" }}>
              {({ height, width }) => (
                <List
                  height={true}
                  rowCount={this.props.layers.length || 0}
                  rowHeight={50}
                  rowRenderer={this.renderRow}
                  width={width}
                />
              )}
            </AutoSizer>
          </ListGroup>
        </Collapse>
      </div>
    );
  }
}

export class LayerManager extends Component {
  render() {
    return (
      <SwitchableCollapse defaultPane="Base Layers">
        <LayerList name="User Layers" layers={this.props.baseLayers} />
        <LayerList name="Overlays" layers={this.props.baseLayers} />
        <LayerList name="Base Layers" layers={this.props.baseLayers} />
      </SwitchableCollapse>
    );
  }
}

LayerManager.propTypes = {
  baseLayers: PropTypes.array,
  overlays: PropTypes.array,
  layer: PropTypes.object
};

function mapStateToProps(state) {
  return {
    baseLayers: state.map.baseLayers,
    overlays: state.map.overlays,
    layer: state.map.layer
  };
}
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setBaselayer,
      addBaselayer,
      removeBaselayer,
      showOverlay,
      hideOverlay,
      addOverlay,
      removeOverlay
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(LayerManager);
