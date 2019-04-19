import _ from "lodash";

//DISTANCES
export const DISTANCE = "distance";
export const METERS = "meters";
export const KILOMETERS = "kilometers";
export const NAUTICAL_MILES = "nautical_miles";
export const MILES = "miles";
export const FEET = "feet";

export const DISTANCE_UNITS = {
  [METERS]: { label: "Meters", abbrv: "m", scale: 1, type: DISTANCE },
  [KILOMETERS]: {
    label: "Kilometers",
    abbrv: "Km",
    scale: 1000,
    type: DISTANCE
  },
  [NAUTICAL_MILES]: {
    label: "Nautical Miles",
    abbrv: "NMi",
    scale: 1852,
    type: DISTANCE
  },
  [MILES]: { label: "Miles", abbrv: "Mi", scale: 1609.34, type: DISTANCE },
  [FEET]: { label: "Feet", abbrv: "Ft", scale: 0.3048, type: DISTANCE }
};

//DURATION
export const DURATION = "duration";
export const SECONDS = "seconds";
export const HOURS = "hours";

export const DURATION_UNITS = {
  [SECONDS]: { label: "Seconds", abbrv: "s", scale: 1, type: DURATION },
  [HOURS]: { label: "Hours", abbrv: "h", scale: 60, type: DURATION }
};

//SPEED
export const SPEED = "speed";
export const METERS_PER_SECOND = "mps";
export const KILOMETERS_PER_HOUR = "kmph";
export const KNOTS = "kt";
export const MILES_PER_HOUR = "mph";
export const FEET_PER_SECOND = "fps";

export const SPEED_UNITS = {
  [METERS_PER_SECOND]: {
    label: "Meters/Second",
    abbrv: "m/s",
    scale: 1,
    type: SPEED
  },
  [KILOMETERS_PER_HOUR]: {
    label: "Kilometers/Hour",
    abbrv: "km/h",
    scale: 0.277778,
    type: SPEED
  },
  [KNOTS]: { label: "Knots", abbrv: "kt", scale: 0.514444, type: "speed" },
  [MILES_PER_HOUR]: {
    label: "Miles/Hour",
    abbrv: "Mi/h",
    scale: 0.44704,
    type: SPEED
  },
  [FEET_PER_SECOND]: {
    label: "Feet/Second",
    abbrv: "Ft/s",
    scale: 0.3048,
    type: SPEED
  }
};

//LATITUDE and LONGITUDE
export const LATITUDE = "lat";
export const LONGITUDE = "lon";
export const DECIMAL_DEGREES = "dd";
export const DMS = "dms";

export const LATITUDE_FORMATS = {
  [DECIMAL_DEGREES]: lat => lat,
  [DMS]: lat => {
    let d = Math.floor(lat);
    let m = Math.floor((lat - d) * 60);
    let s = Math.floor((lat - m) * 60);
    d = _.padStart(`${d}`, 2, "0");
    m = _.padStart(`${m}`, 2, "0");
    s = _.padStart(`${s}`, 2, "0");
    return d + m + s;
  }
};
export const LONGITUDE_FORMATS = {
  [DECIMAL_DEGREES]: lon => lon,
  [DMS]: lon => {
    let d = Math.floor(lon);
    let m = Math.floor((lon - d) * 60);
    let s = Math.floor((lon - m) * 60);
    d = _.padStart(`${d}`, 3, "0");
    m = _.padStart(`${m}`, 2, "0");
    s = _.padStart(`${s}`, 2, "0");
    return d + m + s;
  }
};

//ROTATION
export const ROTATION = "rotation";
export const DEGREES = "deg";
export const RADIANS = "rad";

//ALL
export const UNIT_TYPES = {
  [DISTANCE]: DISTANCE_UNITS,
  [DURATION]: DURATION_UNITS,
  [SPEED]: SPEED_UNITS
};
