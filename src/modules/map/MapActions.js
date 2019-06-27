import uuid from "uuid/v4";
/* Types */
export const SET_MAP_STATE = "SET_MAP_STATE";
export const SET_PROJECTION = "SET_PROJECTION";

export const SET_BASELAYER = "SET_BASELAYER";
export const ADD_BASELAYER = "ADD_BASELAYER";
export const REMOVE_BASELAYER = "REMOVE_BASELAYER";

export const SHOW_OVERLAY = "SHOW_OVERLAY";
export const HIDE_OVERLAY = "HIDE_OVERLAY";
export const ADD_OVERLAY = "ADD_OVERLAY";
export const REMOVE_OVERLAY = "REMOVE_OVERLAY";

export const SHOW_USER_LAYER = "SHOW_USER_LAYER";
export const HIDE_USER_LAYER = "HIDE_USER_LAYER";
export const ADD_USER_LAYER = "ADD_USER_LAYER";
export const UPDATE_USER_LAYER = "UPDATE_USER_LAYER";
export const REMOVE_USER_LAYER = "REMOVE_USER_LAYER";
export const SET_EDITABLE_USER_LAYER = "SET_EDITABLE_USER_LAYER";

export const SET_CENTER = "SET_CENTER";
export const SET_ZOOM = "SET_ZOOM";
export const ZOOM_IN = "ZOOM_IN";
export const ZOOM_OUT = "ZOOM_OUT";
export const SET_BOUNDS = "SET_BOUNDS";
export const SET_VIEWPORT = "SET_VIEWPORT";

export const SET_PANNABLE = "SET_PANNABLE";
export const SET_TIMELINE_VISIBILITY = "SET_TIMELINE_VISIBILITY";
export const TOGGLE_TIMELINE_VISIBILITY = "TOGGLE_TIMELINE_VISIBILITY";

/* Actions */
export const setProjection = projection => ({
  type: SET_PROJECTION,
  projection
});

export const setBaselayer = layer => ({ type: SET_BASELAYER, layer });
export const addBaselayer = layer => ({
  type: ADD_BASELAYER,
  layer
});
export const removeBaselayer = layer => ({ type: REMOVE_BASELAYER, layer });

export const setCenter = center => ({ type: SET_CENTER, center });
export const setZoom = zoom => ({ type: SET_ZOOM, zoom });
export const zoomIn = () => ({ type: SET_ZOOM });
export const zoomOut = () => ({ type: SET_ZOOM });
export const setBounds = bounds => ({ type: SET_BOUNDS, bounds });
export const setViewport = ({ center, zoom, bounds }) => ({
  type: SET_VIEWPORT,
  center,
  zoom,
  bounds
});

export const showOverlay = layer => ({ type: SHOW_OVERLAY, layer });
export const hideOverlay = layer => ({ type: HIDE_OVERLAY, layer });
export const addOverlay = layer => ({ type: ADD_OVERLAY, id: uuid(), layer });
export const removeOverlay = layer => ({ type: REMOVE_OVERLAY, layer });

export const showUserLayer = layer => ({ type: SHOW_USER_LAYER, layer });
export const hideUserLayer = layer => ({ type: HIDE_USER_LAYER, layer });
export const addUserLayer = layer => ({
  type: ADD_USER_LAYER,
  layer
});
export const updateUserLayer = layer => ({ type: UPDATE_USER_LAYER, layer });
export const removeUserLayer = layer => ({ type: REMOVE_USER_LAYER, layer });
export const setEditableUserLayer = layer => ({
  type: SET_EDITABLE_USER_LAYER,
  layer
});

export const setMapState = state => ({ type: SET_MAP_STATE, state });
export const setPannable = pannable => ({ type: SET_PANNABLE, pannable });
export const enablePanning = () => ({ type: SET_PANNABLE, pannable: true });
export const disablePanning = () => ({ type: SET_PANNABLE, pannable: false });

export const setTimelineVisibility = visible => ({
  type: SET_TIMELINE_VISIBILITY,
  visible
});
export const toggleTimeline = () => ({ type: TOGGLE_TIMELINE_VISIBILITY });
export const showTimeline = () => ({
  type: SET_TIMELINE_VISIBILITY,
  visible: true
});
export const hideTimeline = () => ({
  type: SET_TIMELINE_VISIBILITY,
  visible: false
});
