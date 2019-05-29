import L from "leaflet";
import PropTypes from "prop-types";
import uuid from "uuid/v4";
import * as turf from "@turf/turf";
import { withLeaflet, MapControl } from "react-leaflet";

const _defaultFormat = (pts, dist, totalDist, units) => {
  return `<div>
     <div><b>Position: </b> ${pts.length}</div>
     <div><b>Distance: </b> ${dist.toFixed(2)} ${units}</div>
     <div><b>Total Distance: </b> ${totalDist.toFixed(2)} ${units}</div>
   </div>
  `;
};
L.Control.MeasureControl = L.Control.extend({
  _isActive: false,
  _startLatLng: null,
  _paths: new L.LayerGroup(),
  _prevSegments: new L.LayerGroup(),
  _oldWaypoints: new L.LayerGroup(),
  _waypoints: new L.LayerGroup(),
  _segment: null,
  _head: null,

  initialize: function(element) {
    this.options.position = "topleft";
    this.onComplete = element.onComplete;
    this.lineStyle = element.lineStyle;
    this.markerStyle = element.markerStyle || { weight: 1 };
    this.markerRadius = element.markerRadius || 4;
    this.format = element.format || _defaultFormat;
    this.units = "kilometers";
  },
  onAdd: function(map) {
    var div = L.DomUtil.create("div");
    var map = this._map;
    map.addLayer(this._paths);
    map.addLayer(this._prevSegments);
    map.addLayer(this._waypoints);
    map.addLayer(this._oldWaypoints);
    L.DomEvent.on(map, "click", this._handleClick, this);
    div.setAttribute("id", uuid());
    return div;
  },
  onRemove: function(map) {
    var map = this._map;
    L.DomEvent.off(map, "click", this._handleClick, this);
  },
  _reset: function() {
    const map = this._map;
    this._startLatLng = null;
    this._prevSegments.clearLayers();
    this._waypoints.clearLayers();
    if (this._segment) map.removeLayer(this._segment);
    if (this._head) map.removeLayer(this._head);
    this._segment = null;
    this._head = null;
  },
  _updateSegment: function(e) {
    const start = turf.point([this._startLatLng.lng, this._startLatLng.lat]);
    const end = turf.point([e.latlng.lng, e.latlng.lat]);
    const feature = turf.greatCircle(start, end);
    return new L.GeoJSON(feature, { interactive: false });
  },
  _createWaypoint: function(e, permanent = false) {
    var waypoint = new L.CircleMarker(e.latlng, {
      radius: this.markerRadius,
      ...this.markerStyle,
      interactive: !permanent
    });
    let totalDist = 0;
    let dist = 0;
    let prev;
    let pt;
    const oldPositions = [];
    this._waypoints.eachLayer(l => {
      pt = l.toGeoJSON();
      if (prev) dist = turf.distance(prev, pt, { units: this.units });
      totalDist += dist;
      oldPositions.push(pt);
      prev = pt;
    });
    pt = waypoint.toGeoJSON();
    if (prev) {
      dist = turf.distance(prev, pt, { units: this.units });
      totalDist += dist;
    }
    oldPositions.push(pt);
    waypoint
      .bindTooltip(this.format(oldPositions, dist, totalDist, this.units), {
        permanent
      })
      .openTooltip();
    return waypoint;
  },
  _endSegment: function(e) {
    this._prevSegments.eachLayer(l => {
      this._prevSegments.removeLayer(l);
      this._paths.addLayer(l);
    });
    this._waypoints.eachLayer(l => {
      this._waypoints.removeLayer(l);
      this._oldWaypoints.addLayer(l);
    });
    this._reset();
  },
  _handleClick: function(e) {
    const map = this._map;
    if (!this._isActive) return;

    if (
      this._startLatLng &&
      this._startLatLng.lat !== e.latlng.lat &&
      this._startLatLng.lng !== e.latlng.lng
    ) {
      if (this._segment) map.removeLayer(this._segment);
      const newSegment = this._updateSegment(e);
      this._segment = null;
      this._prevSegments.addLayer(newSegment);
      var waypoint = this._createWaypoint(e);
      this._waypoints.addLayer(waypoint);
    } else if (this._prevSegments.getLayers().length > 0) {
      //This is the last point
      this._endSegment(e);
      return;
    } else {
      //This is the first point
      var waypoint = this._createWaypoint(e);
      this._waypoints.addLayer(waypoint);
    }
    this._startLatLng = e.latlng;
  },
  _handleMouseMove: function(e) {
    const map = this._map;
    if (
      !this._startLatLng ||
      (this._startLatLng.lat === e.latlng.lat &&
        this._startLatLng.lng === e.latlng.lng)
    )
      return;
    if (this._segment) map.removeLayer(this._segment);
    if (this._head) map.removeLayer(this._head);
    this._segment = this._updateSegment(e);
    this._head = this._createWaypoint(e, true);
    map.addLayer(this._segment);
    map.addLayer(this._head);
  },
  start: function() {
    var map = this._map;
    L.DomUtil.addClass(map._container, "crosshair-cursor-enabled");
    this._isActive = true;
    this._startLatLng = null;
    L.DomEvent.on(map, "mousemove", this._handleMouseMove, this);
  },
  stop: function() {
    var map = this._map;
    this._isActive = true;
    L.DomUtil.removeClass(map._container, "crosshair-cursor-enabled");
    this._isActive = false;
    this._reset();
    this._prevSegments.clearLayers();
    this._paths.clearLayers();
    this._waypoints.clearLayers();
    this._oldWaypoints.clearLayers();
    L.DomEvent.off(map, "mousemove", this._handleMouseMove, this);
  }
});

L.control.measureControl = opts => {
  return new L.Control.MeasureControl({ ...opts });
};

class MeasureControl extends MapControl {
  control;

  constructor(props) {
    super(props);
  }

  createLeafletElement(props) {
    this.control = L.control.measureControl({ ...props });
    return this.control;
  }
  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (fromProps.active !== toProps.active) {
      toProps.active ? this.control.start() : this.control.stop();
    }
  }
}

export default withLeaflet(MeasureControl);

MeasureControl.propTypes = {
  lineStyle: PropTypes.object,
  markerStyle: PropTypes.object,
  markerRadius: PropTypes.number,
  format: PropTypes.func,
  onComplete: PropTypes.func
};
