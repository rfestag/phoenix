import { UPDATE_SETTINGS } from "./SettingsActions";

const initialState = {
  general: {
    theme: "Dark"
  },
  map: {
    coordinateFormat: "DD"
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SETTINGS:
      return JSON.parse(JSON.stringify(action.settings));
    default:
      return state;
  }
}
