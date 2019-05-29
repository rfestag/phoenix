import "leaflet";
import "leaflet-path-drag";
import "leaflet-editable";
import "../../utils/leaflet-editable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as MapActions from "./MapActions";
import {
  setFocusedEntity,
  setSelectedEntities,
  toggleSelectedEntities
} from "../collection/CollectionActions";
import { emitTimingMetric } from "../metrics/MetricsActions";
import { Map, FeatureGroup } from "react-leaflet";
import CollectionLayer from "./CollectionLayer.js";
import MapToolbar from "./MapToolbar";
import Selectbar from "./Selectbar";
import TimeControl from "./TimeControl";
import _ from "lodash";
import L from "leaflet";
import EditableControl from "./EditableControl";
import ViewControl from "./ViewControl";
import EditFeatureToolbar from "./EditFeatureToolbar";
import MiniMap from "./MiniMap";
import DragBox from "./DragBox";
import MeasureControl from "./MeasureControl";
import ShapeEditPanel from "./ShapeEditPanel";

import { LAYER_TYPE_MAP } from "./MapConstants";

const RECTANGLE = "rectangle";
const CIRCLE = "circle";
const POLYGON = "polygon";
const POLYLINE = "polyline";
const LABEL = "label";
const MEASURE = "measure";
const LOCATE = "locate";
export class Map2D extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.canvas = L.canvas();
    this.collectionLayerRefs = [];
    this.editLayerRefs = [];
    this.state = {
      activeUserLayer: props.userLayers[0],
      activeTool: undefined,
      zoomBoxActive: false,
      editFeature: undefined,
      editToolbarPosition: { x: 0, y: 0 },
      miniMapActive: false,
      center: props.center,
      zoom: props.zoom - 4
    };
  }
  static propTypes = {
    crs: PropTypes.object,
    center: PropTypes.any,
    collections: PropTypes.object.isRequired,
    zoom: PropTypes.number,
    layer: PropTypes.object,
    overlays: PropTypes.array,
    userLayers: PropTypes.array,
    panels: PropTypes.object,
    setViewport: PropTypes.func,
    setFocusedEntity: PropTypes.func,
    setSelectedEntities: PropTypes.func,
    toggleSelectedEntities: PropTypes.func,
    emitTimingMetric: PropTypes.func,
    timelineVisible: PropTypes.bool,
    pannable: PropTypes.bool
  };
  updateViewport = e => {
    const map = this.map.current && this.map.current.leafletElement;
    try {
      let center = map.getCenter();
      this.props.setViewport({
        zoom: map.getZoom(),
        center: [center.lat, center.lng],
        bounds: map.getBounds()
      });
      this.setState({
        zoom: map.getZoom() - 4,
        bounds: map.getBounds(),
        center
      });
    } catch (e) {
      //Do nothing. This can happen in polar projections when you pan too far out
    }
  };
  hideEditToolbar = e => {
    let showEditToolbar = false;
    this.setState({ showEditToolbar, editingShape: undefined });
  };
  setUserLayer = activeUserLayer => {
    this.setState({ activeUserLayer });
  };
  setEditFeature = layer => {
    console.log("SETTING EDIT FEAUTRE", layer);
    this.setState({ editFeature: layer });
  };
  setActiveTool = activeTool => {
    if (activeTool != this.state.activeTool) {
      this.setState({ activeTool, editFeature: undefined });
    }
  };
  clearEditShape = () => {
    console.log("Clearing edit shape");
    this.setState({ editFeature: undefined });
  };
  featureAdded = feature => {
    console.log("TODO: Handle add", feature);
  };
  onClick = e => {
    console.log("MAP CLICK");
    let map = this.map.current && this.map.current.leafletElement;
    if (map) {
      for (let ref of this.collectionLayerRefs) {
        if (ref && ref.leafletElement) {
          ref.leafletElement._onClick(e);
        }
      }
    }
  };
  onContextmenu = L.DomEvent.preventDefault;
  enableBoxZoom = e => {
    if (e.originalEvent.button === 2) {
      L.DomEvent.stopPropagation(e);
      this.setState({ zoomBoxActive: true });
    }
  };
  zoomToBounds = (bounds, map, e) => {
    L.DomEvent.stopPropagation(e);
    map.fitBounds(bounds, { animate: false });
    this.setState({ zoomBoxActive: false });
  };
  selectBounds = (bounds, map, e) => {
    if (!this.state.zoomBoxActive) {
      L.DomEvent.stopPropagation(e);
      console.log("Selecting", bounds);
    }
  };
  onMousemove = _.throttle(
    e => {
      let didHover = false;
      for (let ref of this.collectionLayerRefs) {
        if (ref && ref.leafletElement) {
          let element = ref.leafletElement;
          element._onMouseMove(e);
          didHover = didHover || element._hoverCursor;
        }
      }
      if (didHover && !this._hoverCursor) {
        this.map.current.container.style.cursor = "pointer";
        this._hoverCursor = true;
      } else if (!didHover && this._hoverCursor) {
        this.map.current.container.style.cursor = "";
        this._hoverCursor = false;
      }
    },
    100,
    this
  );

  componentDidMount() {
    const map = this.map.current && this.map.current.leafletElement;
    if (map) {
      console.log("MAP", map);
      map.invalidateSize();
      map.setView(this.props.center, this.props.zoom);

      this.setState({
        center: this.props.center,
        zoom: map.getZoom() - 4,
        bounds: map.getBounds()
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.resize();
    }
    if (this.props.crs !== prevProps.crs) {
      this.componentDidMount();
    }
  }
  resize() {
    const map = this.map.current && this.map.current.leafletElement;
    if (map) {
      map.invalidateSize();
    }
  }
  style = () => {
    return { color: "red" };
  };
  toggleMiniMap = () => {
    this.setState({ miniMapActive: !this.state.miniMapActive });
  };
  editToolbar = e => {
    L.DomEvent.stopPropagation(e);
    let focusedShape = e.target;
    console.log("Focused", focusedShape);
    let showEditToolbar = !this.state.showEditToolbar;
    let editToolbarPosition = e.containerPoint;
    this.setState({ showEditToolbar, focusedShape, editToolbarPosition });
  };
  deleteShape = e => {
    L.DomEvent.stopPropagation(e);
    console.log("TODO: Delete", this.state.focusedShape);
    let showEditToolbar = false;
    this.setState({
      showEditToolbar,
      focusedShape: undefined,
      editingShape: undefined
    });
  };
  cancelShape = e => {
    if (this.state.editFeature) {
      const map = this.map.current && this.map.current.leafletElement;
      const { editFeature } = this.state;
      if (editFeature) {
        const { updated } = editFeature.properties;
        //editFeature.disableEdit();
        //If there is no updated property, this shape was new and should be deleted
        if (!updated) {
          editFeature.remove();
        } else {
          console.log("TODO: Revert shape");
        }
      }
      this.setState({ activeTool: undefined, editFeature: undefined });
    }
  };
  commitShape = e => {
    if (this.state.editFeature) {
      this.setState({ activeTool: undefined, editFeature: undefined });
    }
  };

  render() {
    let cids = Object.keys(this.props.collections);
    const map = this.map.current && this.map.current.leafletElement;
    /*if (map) {
      let pannable = this.props.pannable && !this.state.activeTool === 'select'
      pannable ? map.dragging.enable() : map.dragging.disable();
    }*/
    let BaseLayer = LAYER_TYPE_MAP[this.props.layer.type];
    return (
      this.props.crs && (
        <div style={{ zIndex: 2, width: "100%", height: "100%" }}>
          <ShapeEditPanel
            open={Boolean(this.state.editFeature)}
            shape={this.state.editFeature}
            onApply={this.commitShape}
            onCancel={this.cancelShape}
          />
          <MapToolbar
            map={this.map.current && this.map.current.leafletElement}
            layer={this.state.activeUserLayer}
            activeTool={this.state.activeTool}
            setActiveTool={this.setActiveTool}
            featureAdded={this.featureAdded}
            clearEditShape={this.clearEditShape}
            onLayerChange={this.setUserLayer}
          />
          <ViewControl
            miniMapActive={this.state.miniMapActive}
            toggleMiniMap={this.toggleMiniMap}
          />
          <Map
            ref={this.map}
            key={this.props.crs.name} //This is necessary. It forces the map to re-mount when crs changes
            crs={this.props.crs.crs}
            center={this.props.center}
            {...this.props.crs.settings}
            onLoad={this.mapMounted}
            onClick={this.onClick}
            onMousemove={this.onMousemove}
            onZoomend={this.updateViewport}
            onMoveend={this.updateViewport}
            onContextmenu={this.onContextmenu}
            onMousedown={this.enableBoxZoom}
            editable={true}
            zoom={this.props.zoom}
            zoomControl={false}
            attributionControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            <Selectbar />
            <EditFeatureToolbar
              visible={this.state.showEditToolbar}
              position={this.state.editToolbarPosition}
              editFeature={this.editFeature}
              deleteShape={this.deleteShape}
            />
            <EditableControl
              activeTool={this.state.activeTool}
              activeShape={this.state.editFeature}
              setActiveShape={this.setEditFeature}
            />
            <BaseLayer {...this.props.layer.settings} />
            {_.map(this.props.overlays, overlay => {
              let Overlay = LAYER_TYPE_MAP[overlay.type];
              return overlay.active && <Overlay {...overlay.settings} />;
            })}
            {_.map(this.state.userLayers, (layer, i) => (
              <FeatureGroup ref={ref => (this.editLayerRefs[i] = ref)} />
            ))}
            {_.map(this.props.collections, (collection, cid) => {
              return (
                <CollectionLayer
                  key={cid}
                  ref={ref =>
                    (this.collectionLayerRefs[cids.indexOf(cid)] = ref)
                  }
                  collection={collection}
                  onFocus={this.props.setFocusedEntity}
                  onSelect={this.props.setSelectedEntities}
                  onToggle={this.props.toggleSelectedEntities}
                  onRender={this.props.emitTimingMetric}
                  minZoom={5}
                />
              );
            })}
            <MiniMap
              key={this.props.crs.name}
              projection={this.props.crs}
              worldCopyJump={true}
              center={this.state.center}
              zoom={this.state.zoom}
              active={this.state.miniMapActive}
              bounds={this.state.bounds}
            >
              <BaseLayer {...this.props.layer.settings} />
            </MiniMap>
            <DragBox
              onComplete={this.zoomToBounds}
              boxStyle={{ weight: 1, dashArray: "4", fillColor: "gray" }}
              active={this.state.zoomBoxActive}
            />
            <DragBox
              onComplete={this.selectBounds}
              boxStyle={{
                weight: 1,
                dashArray: "4",
                color: "orange",
                fillColor: "gray"
              }}
              active={this.state.activeTool === "select"}
            />
            <MeasureControl active={this.state.activeTool === "measure"} />
            {this.props.timelineVisible && <TimeControl />}
          </Map>
        </div>
      )
    );
  }
}

//Container part
function mapStateToProps(state, props) {
  //Only map subset of state that map actually requires for rendering
  return {
    center: state.map.center,
    crs: state.map.crs,
    collections: state.collection.collections,
    //collections: getVisibleCollections(state, props),
    //heatmapPoints: getHeatmapPoints(state),
    overlays: state.map.overlays,
    userLayers: state.map.userLayers,
    layer: state.map.layer,
    panels: state.panel,
    zoom: state.map.zoom,
    pannable: state.map.pannable,
    timelineVisible: state.map.timelineVisible
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...MapActions,
      setFocusedEntity,
      setSelectedEntities,
      toggleSelectedEntities,
      emitTimingMetric
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Map2D);
