import { MapLayer, withLeaflet } from "react-leaflet";
import { Layer, LatLng, Bounds, Browser, DomUtil, DomEvent } from "leaflet";
import { Stage, Line, Circle, FastLayer } from "konva";
import * as Util from "leaflet/src/core/Util";
import _ from "lodash";

function shouldDraw(geom, bounds) {
  const bbox = geom.bbox;
  //minlon, minlat, maxlon, maxlat
  if (bbox[0] > bounds._northEast.lng) return false; // box is east of tile
  if (bbox[1] > bounds._northEast.lat) return false; // box is north of tile
  if (bbox[2] < bounds._southWest.lng) return false; // box is west of tile
  if (bbox[3] < bounds._southWest.lat) return false; // box is south of tile
  return true; // boxes overlap
}

function destroyNode(node) {
  if (node === undefined) return;
  _.each(node.getChildren(), c => destroyNode(c));
  node.destroy();
}
export const CollectionLayer = Layer.extend({
  options: {
    // @option padding: Number = 0.1
    // How much to extend the clip area around the map view (relative to its size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0.1,

    // @option tolerance: Number = 0
    // How much to extend click tolerance round a path/object on the map
    tolerance: 0
  },
  beforeAdd: function(map) {},
  onAdd: function() {
    const container = (this._container = document.createElement("div"));
    const self = this;
    this.getPane().appendChild(this._container);
    DomEvent.on(
      container,
      "mousemove",
      Util.throttle(this._onMouseMove, 32, this),
      this
    );
    DomEvent.on(
      container,
      "click dblclick mousedown mouseup contextmenu",
      this._onClick,
      this
    );
    DomEvent.on(container, "mouseout", this._handleMouseOut, this);
    this.throttleRedraw = _.throttle(self.redraw, 750);
    this._map.on("zoomend", this.throttleRedraw, this);
    this._map.on("moveend", this.throttleRedraw, this);
    this.stage = new Stage({ container });
    this.layer = new FastLayer({ transformEnabled: "position" });
    this.stage.add(this.layer);
  },
  onRemove: function() {
    destroyNode(this.stage);
    DomUtil.remove(this._container);
    DomEvent.off(this._container);
    this._map.off("zoomend", this.throttleRedraw);
    this._map.off("moveend", this.throttleRedraw);
    delete this._container;
  },
  redraw: function(fast) {
    const map = this._map;

    if (map) {
      var p = this.options.padding,
        msize = this._map.getSize(),
        min = this._map
          .containerPointToLayerPoint(msize.multiplyBy(-p))
          .round();
      this._bounds = new Bounds(
        min,
        min.add(msize.multiplyBy(1 + p * 2)).round()
      );
      this._center = this._map.getCenter();
      this._zoom = this._map.getZoom();
      this._skipIfUnchanged = fast;
      var b = this._bounds,
        stage = this.stage,
        container = this._container,
        size = b.getSize(),
        m = Browser.retina ? 2 : 1;

      DomUtil.setPosition(container, b.min);

      // set canvas size (also clearing it); use double size on retina
      container.width = m * size.x;
      container.height = m * size.y;
      container.style.width = size.x + "px";
      container.style.height = size.y + "px";
      stage.width(container.width);
      stage.height(container.height);
      stage.position({ x: -b.min.x, y: -b.min.y });

      /*if (Browser.retina) {
		  	stage.scale({x: 2, y: 2});
		  }*/

      console.time("update shapes");
      let count = 0;
      _.each(this.collection.data, (entity, id) => {
        count += 1;
        this._updateEntity(entity, id);
      });
      console.timeEnd("update shapes");
      console.log(count);
      stage.batchDraw();
    }
    return this;
  },
  initialize: function(collection, timeRange, props) {
    this.entities = {};
    this.setTimeRange(timeRange);
    this.setCollection(collection);
  },
  setTimeRange: function(timeRange) {
    this.timeRange = timeRange;
  },
  setCollection: function(collection) {
    this.collection = collection;
    this.redraw();
  },
  _updateEntity: function(entity, id) {
    return (this.entities[id] = _.reduce(
      entity.geometries,
      (geoms, geom, field) => {
        geoms[field] = this._updateGeometry(geom, field, geoms);
        return geoms;
      },
      this.entities[id] || {}
    ));
  },
  _updateGeometry: function(geometryCollection, field, geoms) {
    return (geoms[field] = _.reduce(
      geometryCollection.geometries,
      (geom, geometry, idx) => {
        if (geometry.type === "Point") {
          geom[idx] = this._renderPoint(geometry, geom[idx]);
        } else if (geometry.type === "LineString") {
          geom[idx] = this._renderLine(geometry, geom[idx]);
        }
        return geom;
      },
      geoms[field] || {}
    ));
  },
  _renderPoint: function(geom, shape) {
    if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;
    if (shouldDraw(geom, this._map.getBounds())) {
      const coords = geom.coordinates;
      const pt = this._map.latLngToLayerPoint(
        new LatLng(coords[1], coords[0], coords[2])
      );
      const x = Math.floor(pt.x);
      const y = Math.floor(pt.y);

      if (shape && shape.constructor !== Circle) {
        shape.destroy();
        shape = undefined;
      }
      if (!shape) {
        shape = new Circle({
          shadowForStrokeEnabled: false,
          strokeHitEnabled: false,
          listening: false,
          perfectDrawEnabled: false
        });
        this.layer.add(shape);
      }
      shape._lastGeom = geom;
      shape.x(x);
      shape.y(y);
      shape.radius(1);
      shape.stroke("red");
      shape.strokeWidth(1);
      shape.show();
    } else {
      if (shape) shape.hide();
    }
    return shape;
  },
  _renderLine: function(geom, shape) {
    if (shouldDraw(geom, this._map.getBounds())) {
      const points = geom.coordinates.reduce((pts, p) => {
        const pt = this._map.latLngToLayerPoint(new LatLng(p[1], p[0], p[2]));
        pts.push(Math.floor(pt.x));
        pts.push(Math.floor(pt.y));
        return pts;
      }, []);
      if (shape && shape.constructor !== Line) {
        shape.destroy();
        shape = undefined;
      }
      if (!shape) {
        shape = new Line({
          shadowForStrokeEnabled: false,
          strokeHitEnabled: false,
          listening: false,
          perfectDrawEnabled: false
        });
        this.layer.add(shape);
      }
      shape.points(points);
      shape.tension(0.5);
      shape.stroke("red");
      shape.strokeWidth(2);
      shape.show();
    } else {
      if (shape) shape.hide();
    }
    return shape;
  },
  _onMouseMove: function() {},
  _onClick: function() {},
  _handleMouseOut: function() {}
  /*
  _renderPoint: function(geom, layer, x, y) {
    const p = [geom.coordinates[1], geom.coordinates[0]];
    const pt = this._map.project(p, this._tileZoom);
    let shape = new Circle({
      radius: 1,
      fill: "red",
      strokeWidth: 0,
      x: Math.floor(pt.x - x),
      y: Math.floor(pt.y - y)
    });
    shape.shadowForStrokeEnabled(false);
    shape.strokeHitEnabled(false);
    layer.add(shape);
  },
  renderStage: function(stage, coords, tileBounds) {
    //const tilePixelBounds = this._getTiledPixelBounds();
    //const x = tilePixelBounds.min.x;
    //const y = tilePixelBounds.min.y;
    const x = coords.x * this._tileSize.x;
    const y = coords.y * this._tileSize.y;
    const z = coords.z;
    const layer = stage.getLayers()[0];

    if (!layer || !tileBounds) return;
    console.time("Computing shapes");
    _.each(this.collection.data, (entity, id) => {
      _.each(entity.geometries, (geometryCollection, field) => {
        _.each(geometryCollection.geometries, geom => {
          if (geom && geom.bbox && shouldDraw(geom.bbox, tileBounds)) {
            if (geom.type === "Point") {
              this._renderPoint(geom, layer, x, y);
            } else if (geom.etype === "Track") {
              this._renderLine(geom, layer, x, y);
            }
          }
        });
      });
    });
    console.timeEnd("Computing shapes");
    layer.batchDraw();
  },
  createTile: function(coords) {
    console.log("Creating tile")
    const tile = document.createElement("div");
    const tileSize = this.getTileSize();
    const stage = new Stage({
      container: tile,
      width: tileSize.x,
      height: tileSize.y
    });
    const bounds = this._tileCoordsToBounds(coords);
    const layer = new FastLayer();
    stage.add(layer);
    this.stages[coords] = stage;
    this.renderStage(stage, coords, bounds);
    return tile;
  }
  */
});

class ReactCollectionLayer extends MapLayer {
  createLeafletElement(props) {
    this.redraw = _.throttle(() => this.leafletElement.redraw(true), 2000);
    return new CollectionLayer(props.collection.data, this.getOptions(props));
  }
  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (fromProps.collection !== toProps.collection) {
      this.leafletElement.setCollection(toProps.collection);
    }
  }
}

export default withLeaflet(ReactCollectionLayer);
