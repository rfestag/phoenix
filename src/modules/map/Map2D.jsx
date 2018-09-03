import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as MapActions from "./MapActions";
import { Map, TileLayer } from "react-leaflet";
import CollectionLayer from "./CollectionLayer";
import _ from "lodash";

//const renderer = L.canvas({ padding: 0.5 });

export class Map2D extends Component {
  constructor(props) {
    super(props);
    this.map = React.createRef();
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

  render() {
    return (
      <Map
        ref={this.map}
        crs={this.props.crs.crs}
        center={this.props.center}
        {...this.props.crs.settings}
        zoom={this.props.zoom}
        fadeAnimation={false}
        preferCanvas={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer {...this.props.layer.settings} tileSize={512} />
        {_.map(this.props.collections, (collection, id) => {
          return (
            <CollectionLayer key={id} collection={collection} tileSize={1024} />
          );
          /*
            return (
              <LayerGroup key={id}>
              {
                _.map(collection.data, (entity, id) => {
                  return (entity.geometries && entity.geometries.track && (<GeoJSON key={id} pointToLayer={() => undefined} data={entity.geometries.track} renderer={renderer} />))
                })
              }
              </LayerGroup>
            )
            */
        })}
      </Map>
    );
  }
}

//Container part
function mapStateToProps(state) {
  //Only map subset of state that map actually requires for rendering
  return {
    center: state.map.center,
    crs: state.map.crs,
    collections: state.collection.collections,
    layer: state.map.layer,
    panels: state.panel,
    zoom: state.map.zoom
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...MapActions
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Map2D);
