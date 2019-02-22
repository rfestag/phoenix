import {
  SET_MAP_STATE,
  SET_PROJECTION,
  SET_BASELAYER,
  ADD_BASELAYER,
  REMOVE_BASELAYER,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  ADD_OVERLAY,
  REMOVE_OVERLAY
} from "./MapActions";

const initialState = {
  baseLayers: [],
  center: null,
  crs: null,
  layer: null,
  overlays: [],
  projections: [],
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
function setActiveOverlays(layers, layer, active) {
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
  switch (action.type) {
    case SET_MAP_STATE:
      return action.state;
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
    case REMOVE_BASELAYER:
      const oldLayers = state.baseLayers;
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
      overlays = [...setActiveOverlays(state.overlays, action.layer, true)];
      return { ...state, overlays };
    case HIDE_OVERLAY:
      overlays = [...setActiveOverlays(state.overlays, action.layer, false)];
      return { ...state, overlays };
    default:
      return state;
  }
}
