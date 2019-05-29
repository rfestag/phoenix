import "leaflet";
import "leaflet-path-drag";
import "leaflet-editable";
import L from "leaflet";

L.Editable.include({
  startLabel: function(latlng, options) {
    latlng = latlng || this.map.getCenter().clone();
    var marker = this.createLabel(latlng, options);
    marker.enableEdit(this.map).startDrawing();
    return marker;
  },
  createLabel: function(latlng, options = {}) {
    options.color = "rgba(0, 0, 0, 0, 0)";
    options.fillColor = "rgba(0, 0, 0, 0)";
    return this.createLayer(
      (options && options.labelClass) || this.options.labelClass,
      latlng,
      options
    );
  }
});
L.Editable.mergeOptions({
  labelClass: L.CircleMarker,
  labelEditorClass: undefined
});

var keepEditable = function() {
  // Make sure you can remove/readd an editable layer.
  this.on("add", this._onEditableAdd);
};
// 🍂namespace Editable; 🍂class EditableMixin
// `EditableMixin` is included to `L.Polyline`, `L.Polygon`, `L.Rectangle`, `L.Circle`
// and `L.Marker`. It adds some methods to them.
// *When editing is enabled, the editor is accessible on the instance with the
// `editor` property.*
var EditableMixin = {
  createEditor: function(map) {
    map = map || this._map;
    var tools = (this.options.editOptions || {}).editTools || map.editTools;
    if (!tools) throw Error("Unable to detect Editable instance.");
    var Klass = this.options.editorClass || this.getEditorClass(tools);
    return new Klass(map, this, this.options.editOptions);
  },

  // 🍂method enableEdit(map?: L.Map): this.editor
  // Enable editing, by creating an editor if not existing, and then calling `enable` on it.
  enableEdit: function(map) {
    if (!this.editor) this.createEditor(map);
    this.editor.enable();
    return this.editor;
  },

  // 🍂method editEnabled(): boolean
  // Return true if current instance has an editor attached, and this editor is enabled.
  editEnabled: function() {
    return this.editor && this.editor.enabled();
  },

  // 🍂method disableEdit()
  // Disable editing, also remove the editor property reference.
  disableEdit: function() {
    if (this.editor) {
      this.editor.disable();
      delete this.editor;
    }
  },

  // 🍂method toggleEdit()
  // Enable or disable editing, according to current status.
  toggleEdit: function() {
    if (this.editEnabled()) this.disableEdit();
    else this.enableEdit();
  },

  _onEditableAdd: function() {
    if (this.editor) this.enableEdit();
  }
};

var CircleMarkerMixin = {
  getEditorClass: function(tools) {
    return tools && tools.options.markerEditorClass
      ? tools.options.markerEditorClass
      : L.Editable.MarkerEditor;
  }
};
console.log("MIXINS");
console.log(L.Editable);
console.log(L.Editable.EditableMixin);
console.log(CircleMarkerMixin);
if (L.CircleMarker) {
  L.CircleMarker.include(EditableMixin);
  L.CircleMarker.include(CircleMarkerMixin);
  L.CircleMarker.addInitHook(keepEditable);
}
console.log(new L.CircleMarker());

console.log("Extended editable", L.Editable);
