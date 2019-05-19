import L from "leaflet";
import PropTypes from "prop-types";
import uuid from "uuid/v4";
import { withLeaflet, MapControl } from "react-leaflet";

L.Control.DragBoxControl = L.Control.extend({
  _isActive: false,
  _startLatLng: null,
  _drawPolygon: null,

  initialize: function(element) {
    this.options.position = "topleft";
    this.onComplete = element.onComplete;
    this.boxStyle = element.boxStyle;
  },
  onAdd: function(map) {
    var div = L.DomUtil.create("div");
    var map = this._map;
    L.DomEvent.on(map, "mousedown", this._handleMouseDown, this);
    div.setAttribute("id", uuid());
    return div;
  },
  onRemove: function(map) {
    var map = this._map;
    L.DomEvent.off(map, "mousedown", this._handleMouseDown, this);
    L.DomEvent.off(map, "mousemove", this._handleMouseMove, this);
    L.DomEvent.off(map, "mouseup", this._handleMouseUp, this);
  },
  _handleMouseDown: function(e) {
    if (this._isActive) {
      this._startLatLng = e.latlng;
    }
  },
  _handleMouseMove: function(e) {
    //if (!this._startLatLng) {
    //  this._startLatLng = e.latlng;
    //}
    if (!this._startLatLng) return;
    if (this._map.dragging.enabled()) this._map.dragging.disable();

    var ne = this._startLatLng;
    var nw = new L.LatLng(this._startLatLng.lat, e.latlng.lng);
    var sw = e.latlng;
    var se = new L.LatLng(e.latlng.lat, this._startLatLng.lng);

    if (this._drawPolygon === null || this._drawPolygon === undefined) {
      this._drawPolygon = new L.Polygon([ne, nw, sw, se], {
        interactive: false
      });
      if (this.boxStyle) this._drawPolygon.setStyle(this.boxStyle);
      this._map.addLayer(this._drawPolygon);
    } else {
      this._drawPolygon.setLatLngs([ne, nw, sw, se]);
    }
  },
  _handleMouseUp: function(e) {
    var map = this._map;
    if (
      this._startLatLng &&
      this._startLatLng.lat !== e.latlng.lat &&
      this._startLatLng.lng !== e.latlng.lng &&
      this._isActive
    ) {
      var ne = this._startLatLng;
      var nw = new L.LatLng(this._startLatLng.lat, e.latlng.lng);
      var sw = e.latlng;
      var se = new L.LatLng(e.latlng.lat, this._startLatLng.lng);

      var bounds = L.latLngBounds([ne, sw]);
      if (this.onComplete) this.onComplete(bounds, map, e);
    }

    this._startLatLng = null;
    if (this._drawPolygon) map.removeLayer(this._drawPolygon);
    this._drawPolygon = null;
  },
  start: function() {
    var map = this._map;
    map.dragging.disable();
    L.DomUtil.addClass(map._container, "crosshair-cursor-enabled");
    this._isActive = true;
    this._startLatLng = null;
    L.DomEvent.on(map, "mousemove", this._handleMouseMove, this);
    L.DomEvent.on(map, "mouseup", this._handleMouseUp, this);
  },
  stop: function() {
    var map = this._map;
    this._isActive = true;
    map.dragging.enable();
    L.DomUtil.removeClass(map._container, "crosshair-cursor-enabled");
    this._isActive = false;
    this._startLatLng = null;
    if (this._drawPolygon) map.removeLayer(this._drawPolygon);
    this._drawPolygon = null;
    L.DomEvent.off(map, "mousemove", this._handleMouseMove, this);
    L.DomEvent.off(map, "mouseup", this._handleMouseUp, this);
  }
});

L.control.boxZoomControl = opts => {
  return new L.Control.DragBoxControl({ ...opts });
};

class DragBoxControl extends MapControl {
  control;

  constructor(props) {
    super(props);
  }

  createLeafletElement(props) {
    this.control = L.control.boxZoomControl({ ...props });
    return this.control;
  }
  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (fromProps.active !== toProps.active) {
      toProps.active ? this.control.start() : this.control.stop();
    }
  }
}

export default withLeaflet(DragBoxControl);

DragBoxControl.propTypes = {
  boxStyle: PropTypes.object,
  onComplete: PropTypes.func
};
