import * as turf from "@turf/turf";
import { updateWhen } from "./common";

const findIndex = (data, fn) => {
  //Search backwards through the data. This is because,
  //in the most common cases, the item is close to the end
  for (let i = data.length - 1; i >= 0; i--) {
    if (fn(data[i], i)) return i;
  }
  return -1;
};
const defaultGeometryCollection = {
  type: "GeometryCollection",
  geometries: []
};
const defaultGeometry = {
  coordinates: [],
  when: {
    start: undefined, //Required
    end: undefined, //Optional. If type == Interval and this is not defined, there is no end
    type: undefined //Required. Instant or Interval
  }
};
const defaultPoint = {
  ...defaultGeometry,
  type: "Point"
};
const defaultLineString = {
  ...defaultGeometry,
  type: "LineString"
};
const defaultTrack = {
  ...defaultLineString,
  etype: "Track"
};
const defaultPolygon = {
  ...defaultGeometry,
  type: "Polygon"
};

const crossesAntiMeridian = function(p1, p2) {
  if (p1 === undefined) return 0;
  const l1 = p1[0];
  const l2 = p2[0];
  //When the signs are different, add them together. If the sum
  if (l1 > 0 && l2 < 0) {
    //check for E->W cross
    if (Math.abs(l1 - l2) > 180) return 1;
  } else if (l1 < 0 && l2 > 0) {
    //check for W->E cross
    if (Math.abs(l2 - l1) > 180) return -1;
  }
  return 0;
};
const interpolateTime = function(p1, t1, p2, t2, p3) {};
const createPoint = function(pt, time) {
  let point = { ...defaultPoint, when: { ...defaultPoint.when } };
  point.coordinates = pt;
  point.bbox = turf.bbox(point);
  point.when.start = time;
  return point;
};
export const createTrackPoint = function(pt, time) {
  let point = createPoint(pt, time);
  point.times = [time];
  point.etype = "Track";
  return point;
};
export const createLineString = function(coordinates, start, end) {
  let line = {
    ...defaultLineString,
    coordinates,
    when: { ...defaultPolygon.when }
  };
  line.when.start = start;
  line.when.end = start || end;
  line.bbox = turf.bbox(line);
  return line;
};
export const createPolygon = function(coordinates, start, end) {
  let polygon = {
    ...defaultPolygon,
    coordinates,
    when: { ...defaultPolygon.when }
  };
  polygon.when.start = start;
  polygon.when.end = start || end;
  polygon.bbox = turf.bbox(polygon);
  polygon.center = turf.centroid(polygon).geometry.coordinates;
  return polygon;
};
export const createCircle = function(center, radius, start, end) {
  //Turf expects radius to be in km by default, we will use m by default
  let circle = turf.circle(center, radius / 1000).geometry;
  circle.etype = "Circle";
  circle.center = center;
  circle.radius = radius;
  circle.bbox = turf.bbox(circle);
  circle.when = { ...defaultPolygon.when };
  circle.when.start = start;
  circle.when.end = start || end;
  return circle;
};
export const createEllipse = function(center, smaj, smin, tilt, start, end) {
  let coordinates = []; //TODO: Take parameters, outline polygon
  let ellipse = createPolygon(coordinates);
  ellipse.etype = "Ellipse";
  ellipse.center = center;
  ellipse.smaj = smaj;
  ellipse.smin = smin;
  ellipse.tilt = tilt;
  ellipse.bbox = turf.bbox(ellipse);
  ellipse.when.start = start;
  ellipse.when.end = start || end;
  return ellipse;
};
export const createSector = function(
  center,
  radius,
  bearing1,
  bearing2,
  start,
  end
) {
  //Turf expects radius to be in km by default, we will use m by default
  let sector = turf.sector(center, radius / 1000, bearing1, bearing2).geometry;
  sector.etype = "Sector";
  sector.center = center;
  sector.radius = radius;
  sector.bearing1 = bearing1;
  sector.bearing2 = bearing2;
  sector.when = { ...defaultPolygon.when };
  sector.bbox = turf.bbox(sector);
  sector.when.start = start;
  sector.when.end = start || end;
  return sector;
};
export const createRing = function(center, outer, inner, start, end) {
  let ring = createCircle(center, outer);
  let c2 = createCircle(center, inner);
  ring.etype = "Ring";
  ring.coordinates = ring.coordinates.concat(c2.coordinates);
  ring.center = center;
  ring.innerRadius = inner;
  ring.outerRadius = outer;
  ring.bbox = turf.bbox(ring);
  ring.when.start = start;
  ring.when.end = start || end;
  return ring;
};
const trackFromPoint = function(pt) {
  let track = { ...defaultTrack };
  track.coordinates = [pt.coordinates];
  track.bbox = pt.bbox;
  track.times = pt.times;
  track.when = pt.when;
  return track;
};
const mergeBounds = function(b1, b2) {
  //minX, minY, maxX, maxY
  return [
    b1[0] < b2[0] ? b1[0] : b2[0],
    b1[1] < b2[1] ? b1[1] : b2[1],
    b1[2] > b2[2] ? b1[2] : b2[2],
    b1[3] > b2[3] ? b1[3] : b2[3]
  ];
};
export const ageoffGeometry = (geometry, time) => {
  for (let i in geometry.geometries) {
    let g = geometry.geometries[i];
    if (g.when.end < time) geometry.geometries.splice(i, 1);
    else if (g.etype === "Track") {
      let index = g.times.findIndex(t => t >= time);
      //We don't want to lose the point that is just before the ageoff, in case
      //we need to interpolate. So, we ensure more than one point needs to be removed
      if (index > 1) {
        g.coordinates.splice(0, index - 1);
        g.times.splice(0, index - 1);
        g.when.start = g.times[0];
      }
    }
  }
  return geometry;
};
const updateTrack = (geometry, pt, print) => {
  let segments = geometry.geometries;
  let segment = segments[segments.length - 1];
  //When a track is first created, it is just a point
  if (segment === undefined) {
    geometry.geometries.push(pt);
    return geometry;
  }
  //The if the segment is a point, we can now convert it into a track
  if (segment.type === "Point") {
    segment = trackFromPoint(segment);
    segments[segments.length - 1] = segment;
    updateTrack(geometry, pt, true);
    return geometry;
  }
  let prevPoint = segment.coordinates[segment.length - 1];
  let crossDirection = crossesAntiMeridian(prevPoint, pt);
  let crossTime;
  //Crossed E -> W
  if (crossDirection > 0) {
    //TODO- Interpolate time
    //NOTE - This is untested. Just here to roughly describe what to do
    updateTrack(geometry, [180, pt.coordinates[1]], crossTime);
    geometry.geometries.push(
      createTrackPoint([-180, pt.coordinates[1]], crossTime)
    );
    updateTrack(geometry, pt);
    return geometry;
  }
  //Crossed W => E
  if (crossDirection < 0) {
    //TODO- Interpolate time
    //NOTE - This is untested. Just here to roughly describe what to do
    updateTrack(geometry, [-180, pt.coordinates[1]], crossTime);
    geometry.geometries.push(
      createTrackPoint([180, pt.coordinates[1]], crossTime)
    );
    updateTrack(geometry, pt);
    return geometry;
  }
  //Normal case - Append point to track, update times
  const time = pt.when.start;
  const index = findIndex(segment.times, t => t <= time);
  if (index === segment.times.length - 1) {
    segment.times.push(time);
    segment.coordinates.push(pt.coordinates);
  } else if (index > 0) {
    segment.times.splice(index, 0, time);
    segment.coordinates.splice(index, 0, pt.coordinates);
  } else {
    segment.times.unshift(time);
    segment.coordinates.unshift(pt.coordinates);
  }
  segment.bbox = mergeBounds(segment.bbox, pt.bbox);
  updateWhen(segment, time);
  //if (print) console.log("Should be second point", geometry, pt);
  return geometry;
};

export const cloneGeometry = g => {
  let copy = { ...g };
  if (copy.geometries === defaultGeometryCollection.geometries)
    copy.geometries = [];
  return copy;
};
export const createGeometry = def =>
  def ? cloneGeometry(def) : cloneGeometry(defaultGeometryCollection);

export const updateGeometry = (geometry, update) => {
  if (update.etype === "Track") {
    return updateTrack(geometry, update);
  } else {
    geometry.geometries.push(update);
    return geometry;
  }
  return geometry;
};
