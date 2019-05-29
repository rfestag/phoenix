import L from "leaflet";
import PropTypes from "prop-types";
import uuid from "uuid/v4";
import { withLeaflet, MapControl } from "react-leaflet";

let idx = 0;
const initTooltip = shape => {
  if (!shape._tooltip) {
    shape
      .bindTooltip(shape.properties.name, {
        className: "leaflet-label",
        permanent: true,
        interactive: false,
        direction: "center"
      })
      .openTooltip();
    let dragging = false;
    shape.on("editable:editing", () => {
      if (!dragging) shape.openTooltip();
    });
    if (shape.properties.type === "label") {
      shape.on("drag", () => {
        shape.openTooltip();
        dragging = true;
      });
    } else {
      shape.on("dragstart", () => {
        shape.closeTooltip();
        dragging = true;
      });
      shape.on("dragend", () => {
        shape.openTooltip();
        dragging = false;
      });
    }
  }
};
const defaultHandlers = {
  polygon: (map, pt) => {
    const shape = map.editTools.startPolygon(pt, { draggable: true });
    shape.properties = {
      type: "polygon",
      name: `Polygon ${++idx}`,
      created: Date.now()
    };
    return shape;
  },
  polyline: (map, pt) => {
    const shape = map.editTools.startPolyline(pt, { draggable: true });
    shape.properties = {
      type: "polyline",
      name: `Line ${++idx}`,
      created: Date.now()
    };
    return shape;
  },
  rectangle: (map, pt) => {
    const shape = map.editTools.startRectangle(pt, { draggable: true });
    shape.properties = {
      type: "rectangle",
      name: `Rectangle ${++idx}`,
      created: Date.now()
    };
    initTooltip(shape);
    return shape;
  },
  circle: (map, pt) => {
    const shape = map.editTools.startCircle(pt);
    shape.properties = {
      type: "circle",
      name: `Circle ${++idx}`,
      created: Date.now()
    };
    initTooltip(shape);
    return shape;
  },
  label: (map, pt) => {
    console.log(map.editTools);
    const shape = map.editTools.startLabel(pt, { draggable: true });
    shape.properties = {
      type: "label",
      name: `Label ${++idx}`,
      created: Date.now()
    };
    initTooltip(shape);
    return shape;
  }
};
L.Control.EditableControl = L.Control.extend({
  initialize: function(element) {
    this.onCreated = element.onCreated;
    this.onFocused = element.onFocused;
    this.onStart = element.onStart;
    this.onEnd = element.onEnd;
    this.onCancel = element.onCancel;
    this.onCommit = element.onCommit;
    this.setActiveShape = element.setActiveShape;
    if (
      this.currentLayer &&
      (!element.activeShape || this.currentLayer !== element.activeShape)
    ) {
      this.currentLayer.disableEdit();
      this._map.editTools.stopDrawing();
    }
    this.currentLayer = element.activeShape;
    this.handlers = element.handlers
      ? { ...defaultHandlers, ...element.handlers }
      : defaultHandlers;
    this.setActiveTool(element.activeTool);
  },
  onAdd: function(map) {
    var div = L.DomUtil.create("div");
    L.DomEvent.on(map, "editable:created", this._onCreated, this);
    L.DomEvent.on(map, "editable:editing", this._onEditing, this);
    L.DomEvent.on(map, "click", this._runHandler, this);
    div.setAttribute("id", uuid());
    return div;
  },
  onRemove: function(map) {
    L.DomEvent.off(map, "editable:created", this._onCreated, this);
    L.DomEvent.off(map, "editable:editing", this._onEditing, this);
    L.DomEvent.off(map, "click", this._runHandler, this);
  },
  _onEditing: function(e) {
    initTooltip(e.layer); //Should be safe to init if it isn't already
    if (this.setActiveShape && e.layer !== this.currentLayer)
      this.setActiveShape(e.layer);
    //if (this.onFocused) this.onFocused(e.layer, this.activeTool);
  },
  _onCreated: function(e) {
    const map = this._map;
    const layer = e.layer;
    layer.on("click", e => {
      const layer = e.target;
      L.DomEvent.stopPropagation(e);
      map.editTools.stopDrawing();
      layer.enableEdit();
      if (this.setActiveShape) this.setActiveShape(layer);
    });
  },
  setActiveTool: function(tool) {
    const map = this._map;
    if (map) {
      if (this.activeTool !== tool || (this.activeTool && !this.currentLayer)) {
        map.editTools.stopDrawing();
        this.activeTool = tool;
        if (this.activeTool) this._runHandler({ latlng: undefined });
      }
    }
  },
  _runHandler(e) {
    const map = this._map;
    if (this.activeTool && !this.currentLayer) {
      const handler = this.handlers[this.activeTool];
      if (handler) {
        const layer = handler(map, e.latlng);
        if (this.setActiveShape && layer.properties.type === "label")
          this.setActiveShape(layer);
      }
    }
  }
});

L.control.editableControl = opts => {
  return new L.Control.EditableControl({ ...opts });
};

class EditableControl extends MapControl {
  control;

  createLeafletElement(props) {
    this.control = L.control.editableControl({ ...props });
    return this.control;
  }
  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    this.control.initialize(toProps);
  }
}

export default withLeaflet(EditableControl);

EditableControl.propTypes = {
  activeTool: PropTypes.string,
  onStart: PropTypes.func,
  onEnd: PropTypes.func,
  onCancel: PropTypes.func,
  onCommit: PropTypes.func,
  handlers: PropTypes.object,
  featuresLayer: PropTypes.object
};
