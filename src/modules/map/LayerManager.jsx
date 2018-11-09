import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setBaselayer, showOverlay, hideOverlay } from "./MapActions";
import { AutoSizer, List } from "react-virtualized";
import { Collapse, ListGroup, ListGroupItem } from "reactstrap";
import {
  CollapseHeader,
  SwitchableCollapse
} from "../../components/SwitchableCollapse";
import {
  RevealVisibility,
  RevealContainer,
  RevealButtonGroup,
  RevealButton
} from "../../components/Reveal";

const LayerItemWrapper = styled.div`
  height: 58px;
  position: relative;
  &:hover {
    border: 1px solid ${props => props.theme.accentColor};
  }
`;

const LayerItem = ({ layer, crs }) => (
  <LayerItemWrapper>
    <RevealContainer>
      <ListGroupItem
        style={{ padding: 6, height: "100%", position: "relative" }}
        action
      >
        <RevealVisibility visible={layer.active} />
        <div
          style={{
            width: 42,
            height: 42,
            display: "inline-block",
            border: "1px solid gray"
          }}
        >
          <img alt="" style={{ width: "100%", height: "100%" }} />
        </div>
        <h4
          style={{
            display: "inline-block",
            marginLeft: 6,
            position: "absolute",
            top: 12,
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          {layer.name}
        </h4>
        <RevealButtonGroup style={{ float: "right" }}>
          <RevealButton>A</RevealButton>
          <RevealButton>B</RevealButton>
        </RevealButtonGroup>
      </ListGroupItem>
    </RevealContainer>
  </LayerItemWrapper>
);
LayerItem.propTypes = {
  layer: PropTypes.object,
  crs: PropTypes.object
};

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
    onLayerClick: PropTypes.func,
    name: PropTypes.string
  };
  componentDidUpdate(prevProps) {
    if (this.props.layers !== prevProps.layers) {
      let layers = this.props.layers.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        else return 0;
      });
      console.log("Setting state", layers);
      this.setState({ layers });
    }
  }
  renderRow = ({ key, index, style }) => (
    <div
      key={key}
      style={style}
      onClick={() => this.props.onLayerClick(this.state.layers[index])}
    >
      <LayerItem layer={this.state.layers[index]} />
    </div>
  );
  render() {
    return (
      <div
        style={{
          //flex: 0
          display: "flex",
          overflow: "hidden",
          //flex: '0 1',
          transition: "flex 0.5s ease-out",
          flex: this.props.open ? 1 : 0,
          minHeight: 43,
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
          style={{ overflow: "hidden", flex: this.props.open ? 1 : 0 }}
        >
          <ListGroup style={{ height: "100%" }}>
            <AutoSizer tyle={{ height: "100%" }}>
              {({ height, width }) => (
                <List
                  height={height}
                  data={this.state.layers}
                  rowCount={this.props.layers.length || 0}
                  rowHeight={58}
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
        <LayerList
          name="Overlays"
          layers={this.props.overlays}
          onLayerClick={this.props.toggleOverlay}
        />
        <LayerList
          name="Base Layers"
          layers={this.props.baseLayers}
          onLayerClick={this.props.setBaselayer}
        />
      </SwitchableCollapse>
    );
  }
}

LayerManager.propTypes = {
  baseLayers: PropTypes.array,
  overlays: PropTypes.array,
  layer: PropTypes.object,
  setBaselayer: PropTypes.func,
  toggleOverlay: PropTypes.func,
  onLayerClick: PropTypes.func
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
      toggleOverlay: l => (l.active ? hideOverlay(l) : showOverlay(l))
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(LayerManager);
