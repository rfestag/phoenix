import Utm from "geodesy/utm.js";
import Mgrs, { LatLon } from "geodesy/mgrs.js";

const locations = [
  { lat: 50, lng: 5 },
  { lat: "50:03:59N", lng: "005:42:53W" },
  "58°38′38″N, 003°04′12″W", //DMS
  "31U DQ 48251 11932", //MGRS
  "48 N 377298.745 1483034.794" //UTM
];

function parse(str) {
  for (const k in parsers) {
    const parser = parsers[k];
    try {
      let parsed = parser.parse(str);
      if (parsed) {
        switch (k) {
          case "Utm":
            return parsed.toLatLon();
          case "Mgrs":
            return parsed.toUtm().toLatLon();
          default:
            return parsed;
        }
      }
    } catch (e) {
      //console.error(e)
      //Ignore
    }
  }
}
function format(coordinate, type = "dms", precision = 2) {
  const parsed = LatLon.parse(coordinate);
  return parsed.toString(type, precision);
}

for (const l of locations) {
  let result = parse(l);
  console.log("Result", result);
  console.log("Default", format(result));
  console.log("DD", format(result, "dd"));
  console.log("DMS", format(result, "dms"));
  console.log("UTM", format(result, "utm"));
  console.log("MGRS", format(result, "mgrs"));
}
