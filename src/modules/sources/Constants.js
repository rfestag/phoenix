//DISTANCES
export const METERS = "meters";
export const KILOMETERS = "kilometers";
export const NAUTICAL_MILES = "nautical_miles";
export const MILES = "miles";
export const FEET = "feet";

export const DISTANCE = {
  METERS: { label: "Meters", abbrv: "m", scale: 1 },
  KILOMETERS: { label: "Kilometers", abbrv: "Km", scale: 1000 },
  NAUTICAL_MILES: { label: "Nautical Miles", abbrv: "NMi", scale: 1852 },
  MILES: { label: "Miles", abbrv: "Mi", scale: 1609.34 },
  FEET: { label: "Feet", abbrv: "Ft", scale: 0.3048 }
};

//DURATION
export const SECONDS = "seconds";
export const HOURS = "hours";

export const DURATION = {
  SECONDS: { label: "Seconds", abbrv: "s", scale: 1 },
  HOURS: { label: "Hours", abbrv: "h", scale: 60 }
};

//SPEED
export const METERS_PER_SECOND = "mps";
export const KILOMETERS_PER_HOUR = "kmph";
export const KNOTS = "kt";
export const MILES_PER_HOUR = "mph";
export const FEET_PER_SECOND = "fps";

export const SPEED = {
  METERS_PER_SECOND: { label: "Meters/Second", abbrv: "m/s", scale: 1 },
  KILOMETERS_PER_HOUR: {
    label: "Kilometers/Hour",
    abbrv: "km/h",
    scale: 0.277778
  },
  KNOTS: { label: "Knots", abbrv: "kt", scale: 0.514444 },
  MILES_PER_HOUR: { label: "Miles/Hour", abbrv: "Mi/h", scale: 0.44704 },
  FEET_PER_SECOND: { label: "Feet/Second", abbrv: "Ft/s", scale: 0.3048 }
};
