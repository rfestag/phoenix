import { of } from "rxjs/observable/of";
import { ofType } from "redux-observable";
import { UPDATE_SETTINGS, updateSettings } from "./SettingsActions";
import { KILOMETERS, SECONDS, KILOMETERS_PER_HOUR } from "../sources/Constants";

const DEFAULT_STATE = {
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
export const manageSettings = (action$, state$) => {
  let settings, savedState;

  //We should wrap this in a try-catch to protect against any issues with
  //messed up local state. If we ever fail to pull settings form local storage,
  //simply revert to defaults.
  try {
    settings = localStorage.getItem("settings");
    savedState = settings ? JSON.parse(settings) : DEFAULT_STATE;
  } catch (e) {
    savedState = DEFAULT_STATE;
  }

  //This will, out of band, update settings in local storage
  action$
    .pipe(ofType(UPDATE_SETTINGS))
    .subscribe(({ settings }) =>
      localStorage.setItem("settings", JSON.stringify(settings))
    );

  //When the epic starts, overwrite library defaults with local storage.
  return of(updateSettings(savedState));
};
