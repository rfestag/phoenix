import { MapLayer, withLeaflet } from "react-leaflet";
import { Layer, LatLng, Point, Bounds, Browser, DomUtil } from "leaflet";
import { Stage, Circle, Line, FastLayer } from "konva";
import _ from "lodash";
import * as turf from "@turf/turf";
import moment from "moment";

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
  if (tr.lat < 0) tr.lat = 0;
  if (bl.lat < 0) bl.lat = 0;
  //When we have a map, use actual pixel locations of corners to get unknown parts of bounds
  if (map) {
    let pbounds = map.getPixelBounds();
    //Errors should only occur when point is way out the projection. So
    //We can set the lat to the minimum, and average the longitudes of the known
    //corners
    try {
      tl = map.unproject([pbounds.min.x, pbounds.min.y]);
      if (tl.lat < 0) tl.lat = 0;
    } catch (e) {
      tl = { lat: 0, lng: (tr.lng + bl.lng) / 2 };
    }
    try {
      br = map.unproject([pbounds.max.x, pbounds.max.y]);
      if (br.lat < 0) br.lat = 0;
    } catch (e) {
      br = { lat: 0, lng: (tr.lng + bl.lng) / 2 };
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

function style(shape, selected, hovered) {
  if (hovered) {
    shape.stroke("rgba(255, 255, 0, 1)");
    shape.fill("rgba(255, 255, 0, 0.65)");
    shape.moveToTop();
  } else if (selected) {
    shape.stroke("rgba(0, 0, 255, 1)");
    shape.fill("rgba(0, 0, 255, 0.65)");
  } else {
    shape.stroke("rgba(255, 0, 0, 1)");
    shape.fill("rgba(255, 0, 0, 0.65)");
  }
}
function geomInTime(geom, minTime, maxTime) {
  //We do this just in case there is only a start or end for some
  //reason.
  let { start, end } = geom.when;

  //If we have some sort of time bounds and a time to work with...
  if (minTime && start) {
    //Return undefined if the geom is completely before or after the region
    if (end && end < minTime) {
      return false;
    }
    if (maxTime && start > maxTime) return false;
  }
  return true;
}
function timeBoundedGeom(geom, minTime, maxTime) {
  //We do this just in case there is only a start or end for some
  //reason.
  let start = geom.when.start || geom.when.end;
  let end = geom.when.end || geom.when.start;

  //If we have some sort of time bounds and a time to work with...
  if (minTime && start) {
    //Return undefined if the geom is completely before or after the region
    if (end < minTime) return undefined;
    if (maxTime && start > maxTime) return undefined;

    //If it is a track, calculate partial segment.
    if (geom.etype === "Track" && geom.type === "LineString") {
      //TODO: Interpolate start/end
      let coordinates = [],
        times = [];
      for (let i in geom.times) {
        let t = geom.times[i];
        if (t > minTime && (!maxTime || t < maxTime)) {
          coordinates.push(geom.coordinates[i]);
          times.push(t);
        }
      }
      geom = { ...geom, times, coordinates };
    }
  }
  return geom;
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
    this.throttleRedraw = _.throttle(this.redraw, 100, this);
    this._map.on("movestart", this._onMoveStart, this);
    this._map.on("moveend", this._onMoveEnd, this);
    this._map.on("zoomend", this.throttleRedraw, this);
    this.stage = new Stage({ container });
    this.layer = new FastLayer({ transformEnabled: "position" });
    this.stage.add(this.layer);
  },
  onRemove: function() {
    this.stage.destroy();
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
      let minTime = this.getMinTime();
      let maxTime = undefined; //This is a placeholder until we have full time regions

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

      let deleted = 0;
      let destroyed = 0;
      for (var [id, entity] of this.entities) {
        if (this.collection.data[id] === undefined) {
          _.each(entity, (geom, field) => {
            _.each(geom, (shape, idx) => {
              if (shape) {
                destroyed += 1;
                //shape.geom = null;
                shape.destroy();
              }
            });
          });
          deleted += 1;
          this.entities.delete(id);
        }
      }
      if (deleted > 0)
        console.log(`Destroyed ${destroyed} shapes (${deleted} deleted)`);

      _.each(this.collection.data, (entity, id) => {
        let geoms = this._updateEntity(entity, id, minTime, maxTime);
        this.entities.set(id, geoms);
      });

      stage.batchDraw();
    }
    return this;
  },
  initialize: function(collection, props, timeRange) {
    this.entities = new Map();
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
  getMinTime: function() {
    let ageoff = this.collection.ageoff;
    return ageoff && ageoff.ageoff > 0
      ? moment()
          .subtract(ageoff.ageoff, ageoff.unit)
          .valueOf()
      : undefined;
  },
  _closeTo: function(geom, allBoxes) {
    let minTime = this.getMinTime();
    let maxTime = undefined; //Placeholder
    return _.reduce(
      allBoxes,
      (close, box) => {
        const [, clickBounds, clickBox] = box;
        if (close) return close;
        if (!touchBounds(geom, clickBounds)) return false;
        //TODO: Find a more efficient way to do this. As tracks grow,
        //we'll get more false positives, making this object creation
        //much more expensive
        geom = timeBoundedGeom(geom, minTime, maxTime);
        if (geom === undefined) return false;
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
  _updateEntity: function(entity, id, minTime, maxTime) {
    let geoms = this.entities.get(id);
    return _.reduce(
      entity.geometries,
      (geoms, geom, field) => {
        geoms[field] = this._updateGeometry(
          geom,
          field,
          id,
          geoms,
          minTime,
          maxTime
        );
        return geoms;
      },
      geoms || {}
    );
  },
  _updateGeometry: function(
    geometryCollection,
    field,
    id,
    geoms,
    minTime,
    maxTime
  ) {
    if (
      geoms[field] &&
      geoms[field].length > geometryCollection.geometries.length
    ) {
      let diff = geoms[field].length - geometryCollection.geometries.length;
      let deleted = geoms[field].splice(0, diff);
      _.each(deleted, shape => shape && shape.destroy());
    }
    geoms[field] = _.reduce(
      geometryCollection.geometries,
      (geom, geometry, idx) => {
        //geometry = timeBoundedGeom(geometry, minTime, maxTime)
        //if (geometry === undefined) return geom
        const hovered = this.hovered[id] && this.hovered[id][field];
        const selected =
          this.collection.selected && this.collection.selected[id];
        //Update the shape itself
        let renderer = null;
        if (geometry.etype === "Circle") {
          renderer = "_renderPolygon";
        } else if (geometry.etype === "Sector") {
          renderer = "_renderPolygon";
        } else if (geometry.type === "Polygon") {
          renderer = "_renderPolygon";
        } else if (
          geometry.etype === "Track" ||
          geometry.type === "LineString"
        ) {
          renderer = "_renderLine";
        } else if (geometry.type === "Point") {
          renderer = "_renderPoint";
        }
        if (renderer) {
          geom[idx] = this[renderer](
            geometry,
            geom[idx],
            hovered,
            selected,
            minTime,
            maxTime
          );
        }
        return geom;
      },
      geoms[field] || []
    );
    return geoms[field];
  },
  _renderPoint: function(geom, shape, hovered, selected, minTime, maxTime) {
    //if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;
    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds) && geomInTime(geom, minTime, maxTime)) {
          rendered = true;
          const coords = geom.coordinates;
          const pt = this._map.latLngToLayerPoint(
            new LatLng(coords[1], coords[0] + transform, coords[2])
          );
          const x = Math.floor(pt.x);
          const y = Math.floor(pt.y);

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
          //shape.geom = geom;
          shape.x(x);
          shape.y(y);
          style(shape, selected, hovered);
          shape.show();
        }
        return rendered;
      },
      false
    );
    if (shape && !rendered) shape.hide();
    return shape;
  },
  _renderLine: function(geom, shape, hovered, selected, minTime, maxTime) {
    //if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;

    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        if (rendered) return rendered;
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds) && geomInTime(geom, minTime, maxTime)) {
          rendered = true;
          const zoom = this._map.getZoom();
          let points = [];
          let coordinates =
            geom.type === "Point" ? [geom.coordinates] : geom.coordinates;
          let start = 0;
          let end = coordinates.length - 1;
          if (minTime && geom.etype === "Track")
            start = _.sortedIndex(geom.times, minTime);
          if (maxTime && geom.etype === "Track")
            end = _.sortedIndex(geom.times, maxTime);
          if (start === coordinates.length) start = start - 1;
          if (end === coordinates.length) end = end - 1;
          if (zoom < MIN_SIMPLIFY_ZOOM) {
            const p1 = coordinates[start];
            const p2 = coordinates[end];
            const pt1 = this._map.latLngToLayerPoint(
              new LatLng(p1[1], p1[0] + transform, p1[2])
            );
            const pt2 = this._map.latLngToLayerPoint(
              new LatLng(p2[1], p2[0] + transform, p2[2])
            );
            points = [
              Math.floor(pt1.x),
              Math.floor(pt1.y),
              Math.floor(pt2.x) + 1,
              Math.floor(pt2.y) + 1
            ];
          } else {
            //points = simplifyByZoom(geom, zoom).coordinates.reduce((pts, p) => {
            points = coordinates.reduce((pts, p, i) => {
              //TODO: Interpolate
              if (start <= i && i <= end) {
                const pt = this._map.latLngToLayerPoint(
                  new LatLng(p[1], p[0] + transform, p[2])
                );
                pts.push(Math.floor(pt.x));
                pts.push(Math.floor(pt.y));
              }
              return pts;
            }, points);
          }
          if (points.length > 0) {
            //Special case - if this is a track of one point so far,
            //we tweak the points to make it visible
            if (points.length === 2) {
              points[2] = points[0] + 1;
              points[3] = points[1] + 1;
            }
            if (!shape) {
              shape = new Line({
                shadowForStrokeEnabled: false,
                fillEnabled: false,
                strokeHitEnabled: false,
                listening: false,
                perfectDrawEnabled: false,
                strokeWidth: 2
              });
              this.layer.add(shape);
            }
            //shape.geom = geom;
            shape.points(points);
            shape.tension(0.5);
            style(shape, selected, hovered);
            shape.show();
          } else {
            console.log("Cannot render", start, end, minTime, geom);
          }
        }
        return rendered;
      },
      false
    );
    if (shape && !rendered) shape.hide();
    return shape;
  },
  _renderPolygon: function(geom, shape, hovered, selected, minTime, maxTime) {
    //if (this._skipIfUnchanged && shape && shape.geom === geom) return shape;

    const rendered = _.reduce(
      this._allBounds,
      (rendered, bt) => {
        if (rendered) return rendered;
        const [bounds, transform] = bt;
        if (touchBounds(geom, bounds) && geomInTime(geom, minTime, maxTime)) {
          rendered = true;
          //TODO: Figure out how to use holes. A few issues right now:
          //1) FastLayer doesn't support groups, but Layer is really slow from Konva.
          //2) Requires globalCompositeOperation, but it isn't clear how that works with many
          //   overlaying shapes.
          let [coordinates, ...holes] = geom.coordinates;
          //TODO: Use holes to create holes in the rendered geometry. Requires changes
          //to Konva to support the holes.
          //An idea on how to implement it is here:
          //https://stackoverflow.com/questions/13618844/polygon-with-a-hole-in-the-middle-with-html5s-canvas
          let points = coordinates.reduce((pts, p, i) => {
            const pt = this._map.latLngToLayerPoint(
              new LatLng(p[1], p[0] + transform, p[2])
            );
            pts.push(Math.floor(pt.x));
            pts.push(Math.floor(pt.y));
            return pts;
          }, []);
          //6 "points" really means 3 coordinates. Technically this should always be a minimum of
          //8 (4 coordinates) beacuse GeoJSON requires the last coordinate to match the first
          //coordinate, but we'll keep it looser here because Konva will close it for us
          if (points.length >= 6) {
            if (!shape) {
              shape = new Line({
                shadowForStrokeEnabled: false,
                fillEnabled: true,
                strokeHitEnabled: false,
                listening: false,
                perfectDrawEnabled: false,
                strokeWidth: 2,
                closed: true
              });
              this.layer.add(shape);
            }
            //shape.geom = geom;
            shape.points(points);
            //shape.tension(0);
            style(shape, selected, hovered);
            shape.show();
          }
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
      const t = 6; //Threshold
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
      let didChange = false;
      //const pt = e.latlng //this._map.layerPointToLatLng(e);
      this.hovered = _.reduce(
        this.collection.data,
        (hits, entity, id) => {
          const selected =
            this.collection.selected && this.collection.selected[id];
          return _.reduce(
            entity.geometries,
            (hits, gc, field) => {
              let gHit = false;
              const wasHovered = this.hovered[id] && this.hovered[id][field];
              hits = _.reduce(
                gc.geometries,
                (hits, geometry, idx) => {
                  if (!gHit && this._closeTo(geometry, allBoxes)) {
                    didHover = true;
                    gHit = true;
                    hits[id] = { [field]: true };
                    let e = this.entities.get(id);
                    if (!wasHovered && e && e[field]) {
                      didChange = true;
                      const geoms = e[field];
                      _.each(geoms, (shape, idx) => {
                        if (shape) style(shape, selected, true);
                      });
                    }
                  }
                  return hits;
                },
                hits
              );
              if (!gHit && wasHovered) {
                didChange = true;
                const geoms = this.entities.get(id)[field];
                _.each(geoms, (shape, idx) => {
                  if (shape) style(shape, selected, false);
                });
              }
              return hits;
            },
            hits
          );
        },
        {}
      );
      if (didHover && !this._hoverCursor) {
        this._hoverCursor = true;
      } else if (!didHover && this._hoverCursor) {
        this._hoverCursor = false;
      }
      if (didChange) {
        this.throttleRedraw();
        //this.stage.batchDraw();
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
    let { shiftKey, ctrlKey } = e.originalEvent;
    let clear = !shiftKey && !ctrlKey;
    let clicked = Object.keys(this.hovered).reduce((clicked, id) => {
      if (this.collection.data[id]) clicked.push(this.collection.data[id]);
      return clicked;
    }, []);
    if (clicked.length === 1) {
      if (this.onToggle)
        this.onToggle(this.collection.id, clicked.map(e => e.id), clear);
      if (this.onFocus) this.onFocus(clicked[0].id);
    } else if (clicked.length > 1) {
      if (this.onToggle)
        this.onToggle(this.collection.id, clicked.map(e => e.id), clear);
    }
  }
});

class ReactCollectionLayer extends MapLayer {
  createLeafletElement(props) {
    //this.redraw = _.throttle(() => this.leafletElement.redraw(true), 2000);
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
