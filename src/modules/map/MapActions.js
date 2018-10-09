/* Types */
export const SET_PROJECTION = "SET_PROJECTION";

export const SET_BASELAYER = "SET_BASELAYER";
export const ADD_BASELAYER = "ADD_BASELAYER";
export const REMOVE_BASELAYER = "REMOVE_BASELAYER";

export const SHOW_OVERLAY = "SHOW_OVERLAY";
export const HIDE_OVERLAY = "HIDE_OVERLAY";
export const ADD_OVERLAY = "ADD_OVERLAY";
export const REMOVE_OVERLAY = "REMOVE_OVERLAY";

/* Actions */
export const setProjection = projection => ({
  type: SET_PROJECTION,
  projection
});

export const setBaselayer = layer => ({ type: SET_BASELAYER, layer });
export const addBaselayer = layer => ({ type: ADD_BASELAYER, layer });
export const removeBaselayer = layer => ({ type: REMOVE_BASELAYER, layer });

export const showOverlay = layer => ({ type: SHOW_OVERLAY, layer });
export const hideOverlay = layer => ({ type: HIDE_OVERLAY, layer });
export const addOverlay = layer => ({ type: ADD_OVERLAY, layer });
export const removeOverlay = layer => ({ type: REMOVE_OVERLAY, layer });
