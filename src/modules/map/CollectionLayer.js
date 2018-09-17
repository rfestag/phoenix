import { MapLayer, withLeaflet } from "react-leaflet";
import {
  Layer,
  LatLng,
  Point,
  Bounds,
  Browser,
  DomUtil,
  DomEvent
} from "leaflet";
import { Stage, Line, Circle, FastLayer } from "konva";
import * as Util from "leaflet/src/core/Util";
import _ from "lodash";
import * as turf from "@turf/turf";

function touchBounds(geom, bounds) {
  const bbox = geom.bbox;
  //bbox -> minlon, minlat, maxlon, maxlat
  if (bbox[0] > bounds._northEast.lng) return false; // box is east of tile
  if (bbox[1] > bounds._northEast.lat) return false; // box is north of tile
  if (bbox[2] < bounds._southWest.lng) return false; // box is west of tile
  if (bbox[3] < bounds._southWest.lat) return false; // box is south of tile
  return true; // boxes overlap
}
function pointInBBox(geom, pt) {
  const bbox = geom.bbox;
  //bbox -> minlon, minlat, maxlon, maxlat
  if (pt.lng < bbox[0]) return false;
  if (pt.lat < bbox[1]) return false;
  if (pt.lng > bbox[2]) return false;
  if (pt.lat > bbox[3]) return false;
  return true;
}

function destroyNode(node) {
  if (node === undefined) return;
  _.each(node.getChildren(), c => destroyNode(c));
  node.destroy();
}
function style(shape) {
  shape.stroke("red");
}
function hoverStyle(shape) {
  shape.stroke("yellow");
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
    //TODO: Properly register this so that we can remove the handler
    this._map.on("mousemove", Util.throttle(this._onMouseMove, 32, this), this);
    DomEvent.on(
      container,
      "click dblclick mousedown mouseup contextmenu",
      this._onClick,
      this
    );
    //DomEvent.on(container, "mouseout", this._handleMouseOut, this);
    this.throttleRedraw = _.throttle(self.redraw, 750);
    this._map.on("movestart", this._onMoveStart, this);
    this._map.on("moveend", this._onMoveEnd, this);
    this._map.on("zoomend", this.throttleRedraw, this);
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
    this.hovered = {};
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
  _closeTo: function(geom, clickPt, clickGeo, clickBox, clickBounds) {
    if (!touchBounds(geom, clickBounds)) return false;
    if (geom.type === "Point") return true;
    else {
      if (!touchBounds(geom, clickBounds)) return false;
      if (geom.type === "Polygon") {
        return turf.booleanContains(geom, clickGeo);
      } else if (geom.type === "LineString") {
        return !turf.booleanDisjoint(geom, clickBox);
      }
    }
  },
  _updateEntity: function(entity, id) {
    return (this.entities[id] = _.reduce(
      entity.geometries,
      (geoms, geom, field) => {
        geoms[field] = this._updateGeometry(geom, field, id, geoms);
        return geoms;
      },
      this.entities[id] || {}
    ));
  },
  _updateGeometry: function(geometryCollection, field, id, geoms) {
    return (geoms[field] = _.reduce(
      geometryCollection.geometries,
      (geom, geometry, idx) => {
        const hovered = this.hovered[id] && this.hovered[id][field];
        //Update the shape itself
        if (geometry.type === "Point") {
          geom[idx] = this._renderPoint(geometry, geom[idx], hovered);
        } else if (geometry.type === "LineString") {
          geom[idx] = this._renderLine(geometry, geom[idx], hovered);
        }
        return geom;
      },
      geoms[field] || {}
    ));
  },
  _renderPoint: function(geom, shape, hovered) {
    if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;
    if (touchBounds(geom, this._map.getBounds())) {
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
          perfectDrawEnabled: false,
          radius: 1,
          strokeWidth: 1
        });
        this.layer.add(shape);
      }
      shape._lastGeom = geom;
      shape.x(x);
      shape.y(y);
      hovered ? hoverStyle(shape) : style(shape);
      shape.show();
    } else {
      if (shape) shape.hide();
    }
    return shape;
  },
  _renderLine: function(geom, shape, hovered) {
    if (touchBounds(geom, this._map.getBounds())) {
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
          fillEnabled: false,
          strokeHitEnabled: false,
          listening: false,
          perfectDrawEnabled: true,
          strokeWidth: 2
        });
        this.layer.add(shape);
      }
      shape.points(points);
      shape.tension(0.5);
      hovered ? hoverStyle(shape) : style(shape);
      shape.show();
    } else {
      if (shape) shape.hide();
    }
    return shape;
  },
  _onMouseMove: function(e) {
    console.time("hover");
    if (this.dragging) return;
    const map = this._map;
    const clickPt = map.latLngToLayerPoint(e.latlng);
    const nw = map.layerPointToLatLng(
      new Point(e.layerPoint.x - 5, e.layerPoint.y - 5)
    );
    const ne = map.layerPointToLatLng(
      new Point(e.layerPoint.x + 5, e.layerPoint.y - 5)
    );
    const se = map.layerPointToLatLng(
      new Point(e.layerPoint.x + 5, e.layerPoint.y + 5)
    );
    const sw = map.layerPointToLatLng(
      new Point(e.layerPoint.x - 5, e.layerPoint.y + 5)
    );
    const clickGeo = {
      type: "Point",
      coordinates: [e.latlng.lng, e.latlng.lat]
    };
    const clickBox = {
      type: "Polygon",
      coordinates: [
        [
          [nw.lng, nw.lat],
          [ne.lng, ne.lat],
          [se.lng, se.lat],
          [sw.lng, sw.lat],
          [nw.lng, nw.lat]
        ]
      ]
    };
    const clickBounds = { _northEast: ne, _southWest: sw };
    //const pt = e.latlng //this._map.layerPointToLatLng(e);
    this.hovered = _.reduce(
      this.collection.data,
      (hits, entity, id) => {
        return _.reduce(
          entity.geometries,
          (hits, gc, field) => {
            return _.reduce(
              gc.geometries,
              (hits, geometry, idx) => {
                if (
                  this._closeTo(
                    geometry,
                    clickPt,
                    clickGeo,
                    clickBox,
                    clickBounds
                  )
                ) {
                  hits[id] = { [field]: true };
                  if (this.entities[id] && this.entities[id][field]) {
                    const geoms = this.entities[id][field];
                    _.each(geoms, (shape, idx) => {
                      hoverStyle(shape);
                      try {
                        shape.draw();
                      } catch (e) {}
                    });
                  }
                } else if (this.hovered[id] && this.hovered[id][field]) {
                  //It is no longer a hover, re-style
                  const geoms = this.entities[id][field];
                  _.each(geoms, (shape, idx) => {
                    style(shape);
                    try {
                      shape.draw();
                    } catch (e) {}
                  });
                }
                return hits;
              },
              hits
            );
          },
          hits
        );
      },
      {}
    );
    console.timeEnd("hover");
  },
  _onMoveStart: function(e) {
    this.dragging = true;
  },
  _onMoveEnd: function(e) {
    this.dragging = false;
    this.throttleRedraw();
  },
  _onClick: function(e) {
    console.log(e);
  }
  //_handleMouseOut: function() {}
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
