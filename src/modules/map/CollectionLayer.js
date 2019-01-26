import { MapLayer, withLeaflet } from "react-leaflet";
import { Layer, LatLng, Point, Bounds, Browser, DomUtil } from "leaflet";
import { Stage, Line, Circle, FastLayer } from "konva";
import _ from "lodash";
import * as turf from "@turf/turf";

const MIN_SIMPLIFY_ZOOM = 6;
//const MAX_SIMPLIFY_ZOOM = 8;

function touchBounds(geom, bounds) {
  const bbox = geom.bbox;
  //bbox -> minlon, minlat, maxlon, maxlat
  if (bbox[0] > bounds._northEast.lng) return false; // box is east of tile
  if (bbox[1] > bounds._northEast.lat) return false; // box is north of tile
  if (bbox[2] < bounds._southWest.lng) return false; // box is west of tile
  if (bbox[3] < bounds._southWest.lat) return false; // box is south of tile
  return true; // boxes overlap
}
function polarBounds(bounds, map) {
  let tr = bounds._northEast;
  let bl = bounds._southWest;
  let left, right, tl, br;
  //When we have a map, use actual pixel locations of corners to get unknown parts of bounds
  if (map) {
    let pbounds = map.getPixelBounds();
    //Errors should only occur when point is way out the projection. So
    //We can set the lat to the minimum, and average the longitudes of the known
    //corners
    try {
      tl = map.unproject([pbounds.min.x, pbounds.min.y]);
    } catch (e) {
      tl = { lat: 45, lng: (tr.lng + bl.lng) / 2 };
    }
    try {
      br = map.unproject([pbounds.max.x, pbounds.max.y]);
    } catch (e) {
      br = { lat: 45, lng: (tr.lng + bl.lng) / 2 };
    }
  }
  //When we don't, just transform the box given to us. Not ideal, but no way around it.
  else {
    tl = { lat: tr.lat, lng: bl.lng };
    br = { lat: bl.lat, lng: tr.lng };
  }
  let minlat = Math.min(tr.lat, br.lat, tl.lat, bl.lat);
  let maxlat = Math.max(tr.lat, br.lat, tl.lat, bl.lat);
  let minlng = Math.min(tr.lng, br.lng, tl.lng, bl.lng);
  let maxlng = Math.max(tr.lng, br.lng, tl.lng, bl.lng);
  //All left, all right, or all south
  if ((minlng < 0 && maxlng < 0) || (minlng > 0 && maxlng > 0) || tr.lng < 90) {
    bounds = {
      _northEast: { lat: maxlat, lng: maxlng },
      _southWest: { lat: minlat, lng: minlng }
    };
    return [[bounds, 0]];
  } else {
    //Todo: Handle all-north differently
    if (br.lng < -90) {
      left = {
        _northEast: { lat: 90, lng: bl.lng },
        _southWest: { lat: minlat, lng: tr.lng }
      };
      right = {
        _northEast: { lat: 90, lng: tr.lng },
        _southWest: { lat: minlat, lng: bl.lng }
      };
    } else {
      left = {
        _northEast: { lat: 90, lng: 0 },
        _southWest: { lat: minlat, lng: -180 }
      };
      right = {
        _northEast: { lat: 90, lng: 180 },
        _southWest: { lat: minlat, lng: 0 }
      };
    }
    return [[left, 0], [right, 0]];
  }
}
function getBoundsAndTransforms(bounds, map, boundsFromMap = true) {
  if (map.options.crs.code === "EPSG:3575") {
    const test = polarBounds(bounds, boundsFromMap ? map : undefined);
    return test;
  }

  let west, east;
  if (bounds._northEast.lng > 180) {
    if (bounds._southWest.lng > 180) {
      //When the entire box is "east" of 180 (west is > 180), we translate both corners
      //This only occurs when we pass in a non-map bounds (say, a select box, or the area
      //around the cursor for hover events). In this case, the bounds is entirely on the
      //"eastern" side of the map (but is really the far west). So we return a translated box
      bounds = {
        _southWest: {
          lng: bounds._southWest.lng - 360,
          lat: bounds._southWest.lat
        },
        _northEast: {
          lng: bounds._northEast.lng - 360,
          lat: bounds._northEast.lat
        }
      };
      return [[bounds, -360]];
    } else {
      //When only part of the box crosses 180, we split it.
      //When the eastern bounds is > 180, the "eastern" half
      //of the box is actually the far west.
      //So, we truncate the "western" half of the box at 180, and
      //create a new "eastern" box that is from -180 to the equivalent
      //eastern latitude (by subracting 360)
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
    }
  } else if (bounds._southWest.lng < -180) {
    if (bounds._northEast.lng < -180) {
      //This only occurs when we pass in a non-map bounds (say, a select box, or the area
      //around the cursor for hover events). In this case, the bounds is entirely on the
      //"western" side of the map (but is really the far east). So we return a translated box
      bounds = {
        _southWest: {
          lng: bounds._southWest.lng + 360,
          lat: bounds._southWest.lat
        },
        _northEast: {
          lng: bounds._northEast.lng + 360,
          lat: bounds._northEast.lat
        }
      };
      return [[bounds, +360]];
    } else {
      //When the western bounds is < -180, the "western" half
      //of the box is actually the far east.
      //So, we truncate the "eastern" half of the box at -180, and
      //create a new "western" box that is from the equivalent western
      //longitude (by adding 360) to 180
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
    }
  } else {
    //We are completely within normal bounds, so no need to do anything special
    return [[bounds, 0]];
  }
}

function destroyNode(node) {
  if (node === undefined) return;
  _.each(node.getChildren(), c => destroyNode(c));
  node.destroy();
}
function style(shape, selected) {
  shape.stroke(selected ? "blue" : "red");
  //shape.moveToBottom();
}
function hoverStyle(shape) {
  shape.stroke("yellow");
  shape.moveToTop();
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
    this.getPane().appendChild(this._container);
    //TODO: Properly register this so that we can remove the handler
    //We check for dragging outside of the actual throttle so we can still render after
    this.throttleRedraw = _.throttle(this.redraw, 200, this);
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
    this._map.off("moveend", this.throttleRedraw);
    delete this._container;
  },
  redraw: function(fast) {
    if (this.dragging) return;
    const map = this._map;

    if (map) {
      let mapBounds;
      try {
        mapBounds = this._map.getBounds();
      } catch (e) {
        //The only case this seems to happen is with Polar (3575) projection. Hard coding
        //to its bounds for now. Should change this
        mapBounds = {
          _northEast: { lng: 180, lat: 90 },
          _southWest: { lng: -180, lat: 45 }
        };
      }
      this._allBounds = getBoundsAndTransforms(mapBounds, map);
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
      const width = m * size.x,
        height = m * size.x,
        x = -b.min.x,
        y = -b.min.y;
      const position = stage.position();
      if (width !== container.width) {
        container.style.position = "absolute";
        container.width = width;
        container.style.width = x + "px";
        stage.width(width);
      }
      if (height !== container.height) {
        container.style.position = "absolute";
        container.height = height;
        container.style.height = y + "px";
        stage.height(height);
      }
      if (x !== position.x || y !== position.y) {
        stage.position({ x, y });
      }
      //Update the entity shapes
      const newEntities = _.reduce(
        this.collection.data,
        (entities, entity, id) => {
          entities[id] = this._updateEntity(entity, id);
          return entities;
        },
        {}
      );

      //Destroy cached shape that are no longer present
      //Only need to destroy shapes on "slow" updates (i.e., when
      //shapes themselves have changed, as opposd to pan/zoom)
      if (!fast) {
        let destroyed = 0;
        _.each(this.entities, (entity, id) => {
          if (newEntities[id] === undefined) {
            _.each(this.entities[id], (geom, field) => {
              _.each(geom, (shape, idx) => {
                if (shape) {
                  destroyed += 1;
                  shape.destroy();
                }
              });
            });
          }
        });
        if (destroyed > 0) console.log(`Destroyed ${destroyed} shapes`);
      }

      //Replace entities with the newly generated ones
      this.entities = newEntities;

      stage.batchDraw();
    }
    return this;
  },
  initialize: function(collection, props, timeRange) {
    this.entities = {};
    this.hovered = {};
    this.onSelect = props.onSelect;
    this.onToggle = props.onToggle;
    this.onFocus = props.onFocus;
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
  _closeTo: function(geom, allBoxes) {
    return _.reduce(
      allBoxes,
      (close, box) => {
        const [, clickBounds, clickBox] = box;
        if (close) return close;
        if (!touchBounds(geom, clickBounds)) return false;
        if (geom.type === "Point") return true;
        else {
          return (
            turf.booleanWithin(geom, clickBox) ||
            !turf.booleanDisjoint(geom, clickBox)
          );
        }
      },
      false
    );
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
        const selected =
          this.collection.selected && this.collection.selected[id];
        //Update the shape itself
        if (geometry.etype === "Track" || geometry.type === "LineString") {
          geom[idx] = this._renderLine(geometry, geom[idx], hovered, selected);
        } else if (geometry.type === "Point") {
          geom[idx] = this._renderPoint(geometry, geom[idx], hovered, selected);
        }
        return geom;
      },
      geoms[field] || {}
    ));
  },
  _renderPoint: function(geom, shape, hovered, selected) {
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
          shape.geom = geom;
          shape.x(x);
          shape.y(y);
          hovered ? hoverStyle(shape) : style(shape, selected);
          shape.show();
        }
        return rendered;
      },
      false
    );
    if (shape && !rendered) shape.hide();
    return shape;
  },
  _renderLine: function(geom, shape, hovered, selected) {
    if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;

    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        if (rendered) return rendered;
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds)) {
          rendered = true;
          const zoom = this._map.getZoom();
          let points = [];
          const coordinates =
            geom.type === "Point"
              ? [geom.coordinates, geom.coordinates]
              : geom.coordinates;
          if (zoom < MIN_SIMPLIFY_ZOOM) {
            const p1 = coordinates[0];
            const p2 = coordinates[coordinates.length - 1];
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
            //points = simplifyByZoom(geom, zoom).coordinates.reduce((pts, p) => {
            points = coordinates.reduce((pts, p) => {
              const pt = this._map.latLngToLayerPoint(
                new LatLng(p[1], p[0] + transform, p[2])
              );
              pts.push(Math.floor(pt.x));
              pts.push(Math.floor(pt.y));
              return pts;
            }, points);
          }
          //Special case - if this is a track of one point so far,
          //we tweak the points to make it visible
          if (geom.type === "Point") {
            points[2] += 1;
            points[3] += 1;
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
          shape.geom = geom;
          shape.points(points);
          shape.tension(0.5);
          hovered ? hoverStyle(shape) : style(shape, selected);
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
    try {
      const map = this._map;
      const t = 4; //Threshold
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
      const clickBounds = { _northEast: ne, _southWest: sw };
      const allBounds = getBoundsAndTransforms(clickBounds, map, false);
      const allBoxes = allBounds.map(bt => {
        const [bounds, transform] = bt;
        return [
          transform,
          bounds,
          {
            type: "Polygon",
            coordinates: [
              [
                [nw.lng + transform, nw.lat],
                [ne.lng + transform, ne.lat],
                [se.lng + transform, se.lat],
                [sw.lng + transform, sw.lat],
                [nw.lng + transform, nw.lat]
              ]
            ]
          }
        ];
      });
      //TODO: Instead of create just an allBounds, I need an allBox and allGeos. Better,
      //create an array that has all three in them, since they are based on allBounds translate
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
                  if (this._closeTo(geometry, allBoxes)) {
                    didHover = true;
                    hits[id] = { [field]: true };
                    if (this.entities[id] && this.entities[id][field]) {
                      const geoms = this.entities[id][field];
                      _.each(geoms, (shape, idx) => {
                        //Only redraw if it changed from not hovered to hovered
                        if (
                          shape &&
                          (!this.hovered[id] || !this.hovered[id][field])
                        ) {
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
                      if (shape) {
                        const selected =
                          this.collection.selected &&
                          this.collection.selected[id];
                        style(shape, selected);
                        try {
                          shape.draw();
                        } catch (e) {}
                      }
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
    } catch (e) {
      console.error(e);
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
    console.log("Checking click on", this.collection.id, e);
    let { shiftKey, ctrlKey } = e.originalEvent;
    let clear = !shiftKey && !ctrlKey;
    console.log("Should clear", clear);
    let clicked = Object.keys(this.hovered).map(id => this.collection.data[id]);
    if (clicked.length === 1) {
      console.log("Clicked", clicked[0], this.onToggle);
      if (this.onToggle)
        this.onToggle(this.collection.id, clicked.map(e => e.id), clear);
      if (this.onFocus) this.onFocus(clicked[0].id);
    } else if (clicked.length > 1) {
      console.log("Find closest", clicked);
      if (this.onToggle)
        this.onToggle(this.collection.id, clicked.map(e => e.id), clear);
    }

    //This is to stop the context menu popup. May want to move to its own handler?
    //e.preventDefault();
  }
});

class ReactCollectionLayer extends MapLayer {
  createLeafletElement(props) {
    this.redraw = _.throttle(() => this.leafletElement.redraw(true), 2000);
    return new CollectionLayer(props.collection.data, this.getOptions(props));
  }
  updateLeafletElement(fromProps, toProps) {
    const start = Date.now();
    super.updateLeafletElement(fromProps, toProps);
    if (fromProps.collection !== toProps.collection) {
      this.leafletElement.setCollection(toProps.collection);
    }
    if (this.props.onRender)
      this.props.onRender("MAP_RENDER", Date.now() - start);
  }
}

export default withLeaflet(ReactCollectionLayer);
