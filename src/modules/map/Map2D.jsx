import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as MapActions from "./MapActions";
import { emitTimingMetric } from "../metrics/MetricsActions";
import { Map, TileLayer, FeatureGroup } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import CollectionLayer from "./CollectionLayer.js";
import MapToolbar from "./MapToolbar";
import _ from "lodash";
import { createSelector } from "reselect";
//import Freedraw, { ALL } from 'react-leaflet-freedraw';
import L from "leaflet";
import EditControl from "./EditControl";
import ViewControl from "./ViewControl";

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
  }
  static propTypes = {
    crs: PropTypes.object.isRequired,
    center: PropTypes.array.isRequired,
    collections: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
    layer: PropTypes.object.isRequired
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.resize();
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
  featureChanged = feature => {
    console.log("Feature changed!", feature);
  };

  render() {
    return (
      <Map
        ref={this.map}
        crs={this.props.crs.crs}
        center={this.props.center}
        {...this.props.crs.settings}
        zoom={this.props.zoom}
        preferCanvas={true}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        minZoom={3}
        style={{ width: "100%", height: "100%" }}
      >
        <MapToolbar />
        <ViewControl />
        {/*<HeatmapLayer
          points={this.props.heatmapPoints}
          longitudeExtractor={m => m.location[0]}
          latitudeExtractor={m => m.location[1]}
          intensityExtractor={m => m.value}
        />*/}
        <TileLayer {...this.props.layer.settings} tileSize={512} />
        {_.map(this.props.collections, (collection, cid) => {
          return (
            <CollectionLayer
              key={cid}
              collection={collection}
              onRender={this.props.emitTimingMetric}
              minZoom={5}
            />
          );
        })}
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
    heatmapPoints: getHeatmapPoints(state),
    layer: state.map.layer,
    panels: state.panel,
    zoom: state.map.zoom
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...MapActions,
      emitTimingMetric: (metric, duration) =>
        dispatch(emitTimingMetric(metric, duration))
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Map2D);
