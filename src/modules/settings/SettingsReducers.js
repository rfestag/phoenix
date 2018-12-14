import { UPDATE_SETTINGS } from "./SettingsActions";

const initialState = {
  general: {
    theme: "dark"
  },
  map: {
    coordinateFormat: "DD"
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      console.log("UPDATE", action);
      return action.settings
        ? JSON.parse(JSON.stringify(action.settings))
        : state;
    default:
      return state;
  }
}
