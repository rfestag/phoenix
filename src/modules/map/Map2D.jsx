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
import { Map, TileLayer } from "react-leaflet";
//import HeatmapLayer from "react-leaflet-heatmap-layer";
import CollectionLayer from "./CollectionLayer.js";
import MapToolbar from "./MapToolbar";
import Selectbar from "./Selectbar";
import TimeControl from "./TimeControl";
import _ from "lodash";
//import Freedraw, { ALL } from 'react-leaflet-freedraw';
import L from "leaflet";
//import EditControl from "./EditControl";
import ViewControl from "./ViewControl";
import MiniMap from "./MiniMap";

export class Map2D extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.canvas = L.canvas();
    this.collectionLayerRefs = [];
    this.state = {
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
    panels: PropTypes.object,
    setViewport: PropTypes.func,
    setFocusedEntity: PropTypes.func,
    setSelectedEntities: PropTypes.func,
    toggleSelectedEntities: PropTypes.func,
    emitTimingMetric: PropTypes.func,
    timelineVisible: PropTypes.bool,
    pannable: PropTypes.bool
  };

  componentDidMount() {
    const map = this.map.current && this.map.current.leafletElement;
    if (map) {
      map.invalidateSize();
      map.on(
        "zoomend",
        () => {
          try {
            this.props.setViewport({
              zoom: map.getZoom(),
              center: map.getCenter(),
              bounds: map.getBounds()
            });
            this.setState({ zoom: map.getZoom() - 4, bounds: map.getBounds() });
          } catch (e) {
            //Do nothing. This can happen in polar projections when you pan too far out
          }
        },
        this
      );
      map.on(
        "moveend",
        () => {
          try {
            this.props.setViewport({
              zoom: map.getZoom(),
              center: map.getCenter(),
              bounds: map.getBounds()
            });
            this.setState({ center: map.getCenter(), bounds: map.getBounds() });
          } catch (e) {
            //Do nothing. This can happen in polar projections when you pan too far out
          }
        },
        this
      );
      map.on(
        "click",
        e => {
          for (let ref of this.collectionLayerRefs) {
            if (ref && ref.leafletElement) {
              ref.leafletElement._onClick(e);
            }
          }
        },
        this
      );
      map.on("contextmenu", L.DomEvent.preventDefault);
      map.on(
        "mousemove",
        _.throttle(
          //Util.throttle(
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
          { leading: true, trailing: true }
        ),
        this
      );
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

  render() {
    let cids = Object.keys(this.props.collections);
    const map = this.map.current && this.map.current.leafletElement;
    if (map) {
      this.props.pannable ? map.dragging.enable() : map.dragging.disable();
    }
    return (
      this.props.crs && (
        <Map
          ref={this.map}
          key={this.props.crs.name} //This is necessary. It forces the map to re-mount when crs changes
          crs={this.props.crs.crs}
          center={this.props.center}
          {...this.props.crs.settings}
          onLoad={this.mapMounted}
          zoom={this.props.zoom}
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <MapToolbar />
          <Selectbar />
          <ViewControl
            miniMapActive={this.state.miniMapActive}
            toggleMiniMap={this.toggleMiniMap}
          />
          {/*<HeatmapLayer
          points={this.props.heatmapPoints}
          longitudeExtractor={m => m.location[0]}
          latitudeExtractor={m => m.location[1]}
          intensityExtractor={m => m.value}
        />*/}
          <TileLayer {...this.props.layer.settings} />
          {_.map(this.props.overlays, overlay => {
            return overlay.active && <TileLayer {...overlay.settings} />;
          })}
          {_.map(this.props.collections, (collection, cid) => {
            return (
              <CollectionLayer
                key={cid}
                ref={ref => (this.collectionLayerRefs[cids.indexOf(cid)] = ref)}
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
            <TileLayer {...this.props.layer.settings} />
          </MiniMap>
          {this.props.timelineVisible && <TimeControl />}
        </Map>
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
