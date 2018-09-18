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

const MIN_SIMPLIFY_ZOOM = 6;
const MAX_SIMPLIFY_ZOOM = 8;

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
function getBoundsAndTransforms(bounds) {
  let west, east;
  if (bounds._northEast.lng > 180) {
    west = {
      _southWest: bounds._southWest,
      _northEast: {
        lng: 180,
        lat: bounds._northEast.lat
      }
    };
    east = {
      _southWest: {
        lng: -180,
        lat: bounds._southWest.lat
      },
      _northEast: {
        lng: bounds._northEast.lng - 360,
        lat: bounds._northEast.lat
      }
    };
    return [[east, 360], [west, 0]];
  } else if (bounds._southWest.lng < -180) {
    west = {
      _southWest: {
        lng: bounds._southWest.lng + 360,
        lat: bounds._southWest.lat
      },
      _northEast: {
        lng: 180,
        lat: bounds._northEast.lat
      }
    };
    east = {
      _northEast: bounds._northEast,
      _southWest: {
        lng: -180,
        lat: bounds._southWest.lat
      }
    };
    return [[west, -360], [east, 0]];
  } else {
    return [[bounds, 0]];
  }
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
  shape.moveToTop();
}
function simplifyByZoom(geom, zoom) {
  return geom;
  /*
  if (geom.coordinates.length < 5 || zoom > MAX_SIMPLIFY_ZOOM) return geom
  let tolerance
  if (zoom === 8) tolerance = 0.01
  else if (zoom === 7) tolerance = 0.05
  else if (zoom === 6) tolerance = 0.1
  else if (zoom === 5) tolerance = 5
  return turf.simplify(geom, {tolerance})
  */
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
      this._allBounds = getBoundsAndTransforms(this._map.getBounds());
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
      console.log(count, this._map.getZoom());
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
      if (geom.type === "Polygon") {
        return turf.booleanContains(geom, clickGeo);
      } else if (geom.type === "LineString") {
        return !turf.booleanDisjoint(geom, clickBox);
      }
    }
  },
  _updateEntity: function(entity, id) {
    const e = (this.entities[id] = _.reduce(
      entity.geometries,
      (geoms, geom, field) => {
        geoms[field] = this._updateGeometry(geom, field, id, geoms);
        return geoms;
      },
      this.entities[id] || {}
    ));
    return e;
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
    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds)) {
          rendered = true;
          const coords = geom.coordinates;
          const pt = this._map.latLngToLayerPoint(
            new LatLng(coords[1], coords[0] + transform, coords[2])
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
        }
        return rendered;
      },
      false
    );
    if (shape && !rendered) shape.hide();
    return shape;
  },
  _renderLine: function(geom, shape, hovered) {
    if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;

    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds)) {
          rendered = true;
          const zoom = this._map.getZoom();
          let points = [];
          if (zoom < MIN_SIMPLIFY_ZOOM) {
            const p1 = geom.coordinates[0];
            const p2 = geom.coordinates[geom.coordinates.length - 1];
            const pt1 = this._map.latLngToLayerPoint(
              new LatLng(p1[1], p1[0] + transform, p1[2])
            );
            const pt2 = this._map.latLngToLayerPoint(
              new LatLng(p2[1], p2[0] + transform, p2[2])
            );
            points = [
              Math.floor(pt1.x),
              Math.floor(pt1.y),
              Math.floor(pt2.x),
              Math.floor(pt2.y)
            ];
          } else {
            points = simplifyByZoom(geom, zoom).coordinates.reduce((pts, p) => {
              const pt = this._map.latLngToLayerPoint(
                new LatLng(p[1], p[0] + transform, p[2])
              );
              pts.push(Math.floor(pt.x));
              pts.push(Math.floor(pt.y));
              return pts;
            }, points);
          }
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
        }
        return rendered;
      },
      false
    );
    if (shape && !rendered) shape.hide();
    return shape;
  },
  _onMouseMove: function(e) {
    //console.time("hover");
    if (this.dragging) return;
    const map = this._map;
    const t = 8; //Threshold
    const clickPt = map.latLngToLayerPoint(e.latlng);
    const nw = map.layerPointToLatLng(
      new Point(e.layerPoint.x - t, e.layerPoint.y - t)
    );
    const ne = map.layerPointToLatLng(
      new Point(e.layerPoint.x + t, e.layerPoint.y - t)
    );
    const se = map.layerPointToLatLng(
      new Point(e.layerPoint.x + t, e.layerPoint.y + t)
    );
    const sw = map.layerPointToLatLng(
      new Point(e.layerPoint.x - t, e.layerPoint.y + t)
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
    let didHover = false;
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
                  didHover = true;
                  hits[id] = { [field]: true };
                  if (this.entities[id] && this.entities[id][field]) {
                    const geoms = this.entities[id][field];
                    _.each(geoms, (shape, idx) => {
                      //Only redraw if it changed from not hovered to hovered
                      if (!this.hovered[id] || !this.hovered[id][field]) {
                        hoverStyle(shape);
                        try {
                          shape.draw();
                        } catch (e) {}
                      }
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
    if (didHover && !this._hoverCursor) {
      this._container.style.cursor = "pointer";
      this._hoverCursor = true;
    } else if (!didHover && this._hoverCursor) {
      this._container.style.cursor = "";
      this._hoverCursor = false;
    }
    //console.timeEnd("hover");
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
