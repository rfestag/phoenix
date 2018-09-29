import {
  COLLAPSE_PANEL,
  TOGGLE_PANE,
  SET_PANE,
  LEFT_PANEL,
  RIGHT_PANEL,
  BOTTOM_PANEL
} from "./PanelActions";
const initialState = {
  [LEFT_PANEL]: undefined,
  [RIGHT_PANEL]: undefined,
  [BOTTOM_PANEL]: undefined
};
export default function(state = initialState, action) {
  switch (action.type) {
    case COLLAPSE_PANEL:
      return { ...state, [action.panel]: undefined };
    case TOGGLE_PANE:
      console.log("Toggling", action, state);
      if (state[action.panel] === action.pane)
        return { ...state, [action.panel]: undefined };
      else return { ...state, [action.panel]: action.pane };
    case SET_PANE:
      return { ...state, [action.panel]: action.pane };
    default:
      return state;
  }
}
