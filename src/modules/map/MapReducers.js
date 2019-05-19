import {
  SET_CENTER,
  SET_ZOOM,
  SET_BOUNDS,
  SET_VIEWPORT,
  SET_MAP_STATE,
  SET_PROJECTION,
  SET_BASELAYER,
  ADD_BASELAYER,
  REMOVE_BASELAYER,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  ADD_OVERLAY,
  REMOVE_OVERLAY,
  SHOW_USER_LAYER,
  HIDE_USER_LAYER,
  ADD_USER_LAYER,
  UPDATE_USER_LAYER,
  REMOVE_USER_LAYER,
  SET_EDITABLE_FEATURE,
  UNSET_EDITABLE_FEATURE,
  UPDATE_FEATURE,
  SET_PANNABLE,
  SET_TIMELINE_VISIBILITY,
  TOGGLE_TIMELINE_VISIBILITY
} from "./MapActions";

const initialState = {
  baseLayers: [],
  center: undefined,
  crs: undefined,
  layer: undefined,
  editFeature: undefined,
  overlays: [],
  userLayers: [],
  projections: [],
  pannable: true,
  timelineVisible: true,
  zoom: 3
};
function setActiveBaselayer(layers, layer) {
  let oldIndex = layers.findIndex(l => l.active);
  let newIndex = layers.findIndex(l => l === layer);
  console.log(oldIndex, newIndex);
  if (oldIndex < 0 || newIndex < 0) return layers;
  layers = [...layers];
  layers[oldIndex] = { ...layers[oldIndex], active: false };
  layers[newIndex] = { ...layers[newIndex], active: true };
  return layers;
}
function setActiveLayer(layers, layer, active) {
  let idx = layers.findIndex(l => l === layer);
  if (idx < 0) return layers;
  layer = { ...layer, active };
  layers[idx] = layer;
  return layers;
}
export default function(state = initialState, action) {
  /* TODO: Implement above actions */
  let idx = -1;
  let baseLayers;
  let overlays;
  let userLayers;
  let oldLayers;
  let feature;
  let layer;
  switch (action.type) {
    case SET_MAP_STATE:
      return action.state;
    case SET_PANNABLE:
      return { ...state, pannable: action.pannable };
    case SET_TIMELINE_VISIBILITY:
      return { ...state, timelineVisible: action.visible };
    case TOGGLE_TIMELINE_VISIBILITY:
      return { ...state, timelineVisible: !state.timelineVisible };
    case SET_CENTER:
      return { ...state, center: action.center };
    case SET_ZOOM:
      return { ...state, zoom: action.zoom };
    case SET_BOUNDS:
      return { ...state, bounds: action.bounds };
    case SET_VIEWPORT:
      let { bounds, zoom, center } = action;
      return { ...state, bounds, zoom, center };
    case SET_PROJECTION:
      return { ...state, crs: action.projection };
    case SET_BASELAYER:
      if (action.layer === state.layer) return state; //No change
      if (state.crs.projection === action.layer.projection) {
        baseLayers = setActiveBaselayer(state.baseLayers, action.layer);
        if (baseLayers === state.baseLayers) return state; //No change
        console.log("New base layers", baseLayers);
        return { ...state, baseLayers, layer: action.layer };
      } else {
        let projection = state.projections.find(
          p => p.projection === action.layer.projection
        );
        baseLayers = setActiveBaselayer(state.baseLayers, action.layer);
        if (baseLayers === state.baseLayers) return state; //No change
        console.log("New base layers", baseLayers, projection);
        return {
          ...state,
          baseLayers,
          center: projection.settings.center,
          layer: action.layer,
          crs: projection
        };
      }
    case ADD_BASELAYER:
      return { ...state, baseLayers: [...state.baseLayers, action.layer] };
    case ADD_OVERLAY:
      return { ...state, overlays: [...state.overlays, action.layer] };
    case ADD_USER_LAYER:
      return { ...state, userLayers: [...state.userLayers, action.layer] };
    case REMOVE_BASELAYER:
      oldLayers = state.baseLayers;
      idx = oldLayers.indexOf(action.layer);
      if (idx >= 0)
        return {
          ...state,
          baseLayers: [...oldLayers.slice(0, idx), ...oldLayers.slice(idx + 1)]
        };
      return state;
    case REMOVE_OVERLAY:
      const oldOverlays = state.overlays;
      idx = oldOverlays.indexOf(action.layer);
      if (idx >= 0)
        return {
          ...state,
          overlays: [
            ...oldOverlays.slice(0, idx),
            ...oldOverlays.slice(idx + 1)
          ]
        };
      return state;
    case SHOW_OVERLAY:
      overlays = [...setActiveLayer(state.overlays, action.layer, true)];
      return { ...state, overlays };
    case HIDE_OVERLAY:
      overlays = [...setActiveLayer(state.overlays, action.layer, false)];
      return { ...state, overlays };
    case REMOVE_USER_LAYER:
      oldLayers = state.userLayer;
      idx = oldLayers.indexOf(action.layer);
      if (idx >= 0)
        return {
          ...state,
          userLayers: [...oldLayers.slice(0, idx), ...oldLayers.slice(idx + 1)]
        };
      return state;
    case SHOW_USER_LAYER:
      userLayers = [...setActiveLayer(state.userLayers, action.layer, true)];
      return { ...state, userLayers };
    case HIDE_USER_LAYER:
      userLayers = [...setActiveLayer(state.userLayers, action.layer, false)];
      return { ...state, userLayers };
    case UPDATE_USER_LAYER:
      userLayers = [...state.userLayers];
      idx = userLayers.findIndex(l => l.id === action.layer.id);
      if (idx) {
        userLayers[idx] = action.layer;
        return { ...state, userLayers };
      } else {
        console.log("No matching user layer to update");
        return state;
      }
    case SET_EDITABLE_FEATURE:
      return { ...state, editFeature: action.layer };
    case UNSET_EDITABLE_FEATURE:
      return { ...state, editFeature: undefined };
    default:
      return state;
  }
}
