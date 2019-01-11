import { UPDATE_SETTINGS } from "./SettingsActions";
import { KILOMETERS, SECONDS, KILOMETERS_PER_HOUR } from "../sources/Constants";

const initialState = {
  general: {
    theme: "dark"
  },
  map: {
    coordinateFormat: "DD"
  },
  units: {
    distance: KILOMETERS,
    duration: SECONDS,
    speed: KILOMETERS_PER_HOUR
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
