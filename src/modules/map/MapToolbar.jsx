import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import L from "leaflet";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Button, ButtonGroup } from "reactstrap";
import {
  AddIcon,
  EditIcon,
  SelectIcon,
  PolylineToolIcon,
  PolygonToolIcon,
  CircleToolIcon,
  BoxToolIcon,
  MeasureToolIcon,
  WhatsHereToolIcon,
  LabelToolIcon
} from "../../components/Icons";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import {
  addUserLayer,
  updateUserLayer,
  setEditableFeature,
  unsetEditableFeature
} from "./MapActions";

const SelectLayerBtn = styled(DropdownToggle)`
  text-align: left !important;
`;

const Wrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 500;
  display: flex;
`;
const AOISearch = styled(Input)`
  float: right;
  width: 300px !important;
  border: none !important;
  box-shadow: none !important;
`;
const Filler = styled.div`
  flex: 1;
  background-color: ${props => props.theme.mapControlBg};
`;
const ToolbarButton = styled(Button)`
  border: none !important;
`;

export class MapToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      activeTool: undefined
    };
  }
  static propTypes = {
    map: PropTypes.object,
    setActiveTool: PropTypes.func,
    clearEditShape: PropTypes.func,
    onLayerChange: PropTypes.func,
    layer: Proptypes.object,
    activeTool: PropTypes.string,
    updateUserLayer: PropTypes.func,
    layers: PropTypes.array
  };
  componentDidMount = () => {
    let { map } = this.props;
    console.log("MOUNTING", map);
    if (map) {
      let { clearEditShape } = this.props;
      map.on("editable:created", function(e) {
        console.log("CREATED", e);
      });
    }
  };
  setCurrentLayer = layer => {
    this.props.onLayerChange(layer);
  };
  addLayer = () => {
    console.log("TODO: Modal for adding layer");
  };
  toggleEdit = () => {
    const edit = !this.state.edit;
    console.log("EDIT TOGGLED", this.props.map.editTools);
    this.setState({ edit, activeTool: undefined });
  };
  toggleTool = (tool, e) => {
    console.log("Toggling", tool);
    L.DomEvent.stopPropagation(e);
    return this.props.activeTool === tool ? undefined : tool;
  };
  addShapeToLayer = e => {};
  activateMeasure = e => {
    this.props.setActiveTool(this.toggleTool("measure", e));
  };
  activateSelect = e => {
    this.props.setActiveTool(this.toggleTool("select", e));
  };
  activateLocate = e => {
    this.props.setActiveTool(this.toggleTool("locate", e));
  };
  activateBox = e => {
    this.props.setActiveTool(this.toggleTool("rectangle", e));
  };
  activateCircle = e => {
    this.props.setActiveTool(this.toggleTool("circle", e));
  };
  activateLine = e => {
    this.props.setActiveTool(this.toggleTool("polyline", e));
  };
  activatePolygon = e => {
    this.props.setActiveTool(this.toggleTool("polygon", e));
  };
  activateLabel = e => {
    this.props.setActiveTool(this.toggleTool("label", e));
  };
  addFeature = (geometry, properties) => {
    let layer = { ...this.props.layer };
    layer.features = layer.features.map(f => {
      if (f.properties.editing)
        f.properties = { ...f.properties, editing: false };
      return f;
    });
    layer.features.push({ type: "Feature", geometry, properties });
    this.props.updateUserLayer(layer);
  };
  /*
  activateGroup = () => {
    this.toggleTool('group', e)
  }
  activateUngroup = () => {
    this.toggleTool('ungroup', e)
  }
  */
  render() {
    const {
      setCurrentLayer,
      addLayer,
      toggleEdit,
      activateMeasure,
      activateSelect,
      activateLocate,
      activateBox,
      activateCircle,
      activateLine,
      activatePolygon,
      activateLabel,
      activateGroup,
      activateUngroup
    } = this;
    const { edit } = this.state;
    const { layers, map, activeTool, layer } = this.props;
    return (
      <Wrapper>
        <Filler />
        {edit ? (
          <Dropdown setActiveFromChild>
            <SelectLayerBtn color="map-control" caret>
              {layer ? layer.name : <em>No Active Layers</em>}
            </SelectLayerBtn>
            <DropdownMenu>
              <DropdownItem>
                <AddIcon onClick={addLayer} /> Add Layer
              </DropdownItem>
              <DropdownItem divider />
              {layers &&
                layers.map((l, i) => (
                  <DropdownItem key={i} onClick={() => setCurrentLayer(l)}>
                    {l.name}
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        ) : null}
        {edit ? (
          <ButtonGroup>
            <ToolbarButton
              className={activeTool === "rectangle" ? "active" : null}
              onClick={activateBox}
              color="map-control"
              disabled={!layer}
            >
              <BoxToolIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "circle" ? "active" : null}
              onClick={activateCircle}
              color="map-control"
              disabled={!layer}
            >
              <CircleToolIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "polyline" ? "active" : null}
              onClick={activateLine}
              color="map-control"
              disabled={!layer}
            >
              <PolylineToolIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "polygon" ? "active" : null}
              onClick={activatePolygon}
              color="map-control"
              disabled={!layer}
            >
              <PolygonToolIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "label" ? "active" : null}
              onClick={activateLabel}
              color="map-control"
              disabled={!layer}
            >
              <LabelToolIcon />
            </ToolbarButton>
          </ButtonGroup>
        ) : null}
        {!edit ? (
          <ButtonGroup>
            <ToolbarButton
              className={activeTool === "select" ? "active" : null}
              onClick={activateSelect}
              color="map-control"
            >
              <SelectIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "measure" ? "active" : null}
              onClick={activateMeasure}
              color="map-control"
            >
              <MeasureToolIcon />
            </ToolbarButton>
            <ToolbarButton
              className={activeTool === "locate" ? "active" : null}
              onClick={activateLocate}
              color="map-control"
            >
              <WhatsHereToolIcon />
            </ToolbarButton>
          </ButtonGroup>
        ) : null}
        <ButtonGroup>
          <ToolbarButton
            className={edit ? "active" : null}
            color="map-control"
            onClick={toggleEdit}
          >
            <EditIcon />
          </ToolbarButton>
        </ButtonGroup>
        <AOISearch placeholder="Search areas of interest" />
      </Wrapper>
    );
  }
}

function mapStateToProps(state, props) {
  //Only map subset of state that map actually requires for rendering
  return {
    layers: state.map.userLayers
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      addUserLayer,
      updateUserLayer,
      setEditableFeature
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(MapToolbar);
