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
import _ from "lodash";
import { createSelector } from "reselect";
//import Freedraw, { ALL } from 'react-leaflet-freedraw';
import L, { Util } from "leaflet";
//import EditControl from "./EditControl";
import ViewControl from "./ViewControl";
import MiniMap from "./MiniMap";

const collectionsSelector = state => state.collection.collections;
const ptsSelector = collections => {
  const result = _.reduce(
    collections,
    (points, collection) => {
      return _.reduce(
        collection.data,
        (points, entity) => {
          return _.reduce(
            entity.geometries,
            (points, geometryCollection) => {
              return _.reduce(
                geometryCollection.geometries,
                (points, g) => {
                  if (g.type === "Point")
                    points.push({ location: g.coordinates, value: 1 });
                  else if (g.type === "LineString")
                    points.push({
                      location: g.coordinates[0],
                      value: g.coordinates.length
                    });
                  return points;
                },
                points
              );
            },
            points
          );
        },
        points
      );
    },
    []
  );
  return result;
};

const getHeatmapPoints = createSelector(collectionsSelector, ptsSelector);

export class Map2D extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
    this.canvas = L.canvas();
    this.collectionLayerRefs = [];
    this.state = {
      miniMapActive: false,
      center: props.center,
      zoom: props.zoom
    };
  }
  static propTypes = {
    crs: PropTypes.object.isRequired,
    center: PropTypes.array.isRequired,
    collections: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
    layer: PropTypes.object.isRequired,
    overlays: PropTypes.array.isRequired,
    panels: PropTypes.object,
    setFocusedEntity: PropTypes.func,
    setSelectedEntities: PropTypes.func,
    toggleSelectedEntities: PropTypes.func,
    emitTimingMetric: PropTypes.func
  };

  componentDidMount() {
    const map = this.map.current && this.map.current.leafletElement;
    const self = this;
    console.log("MOUNTING MAP");
    if (map) {
      map.invalidateSize();
      map.on(
        "zoomend",
        () => {
          try {
            this.setState({ zoom: map.getZoom() - 4, bounds: map.getBounds() });
          } catch (e) {
            console.log("Sad panda zoom");
            //Do nothing. This can happen in polar projections when you pan too far out
          }
        },
        this
      );
      map.on(
        "moveend",
        () => {
          try {
            this.setState({ center: map.getCenter(), bounds: map.getBounds() });
          } catch (e) {
            console.log("Sad panda move");
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
        Util.throttle(
          e => {
            for (let ref of this.collectionLayerRefs) {
              if (ref && ref.leafletElement) {
                ref.leafletElement._onMouseMove(e);
              }
            }
          },
          32,
          this
        ),
        this
      );

      this.setState({
        center: map.getCenter(),
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
      console.log("Should bind map events");
      this.componentDidMount();
    }
  }
  resize() {
    const map = this.map.current.leafletElement;
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
  mapMounted = () => {
    console.log("Map mounted");
  };
  featureChanged = feature => {
    console.log("Feature changed!", feature);
  };

  render() {
    let cids = Object.keys(this.props.collections);
    return (
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
      </Map>
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
    zoom: state.map.zoom
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
