import * as turf from "@turf/turf";
import { updateWhen } from "./common";

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

const crossesAntiMeridian = function(p1, p2) {
  //TODO: Implement check. Need E->W and W->E
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
const trackFromPoint = function(pt) {
  let track = { ...defaultTrack };
  track.coordinates = [[...pt.coordinates]];
  track.bbox = [...pt.bbox];
  track.times = [...pt.times];
  track.when = { ...pt.when };
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
  /*
  let prevPoint = segment.coordinates[segment.length-1]
  let crossDirection = crossesAntiMeridian(prevPoint, pt)
  let crossTime
  //Crossed E -> W 
  if (crossDirection > 0) {
    //TODO- Interpolate time
    //NOTE - This is untested. Just here to roughly describe what to do
    updateTrack(geometry, [180, pt.coordinates[1]], crossTime)
    geometry.geometries.push(createTrackPoint([-180, pt.coordinates[1]], crossTime))
    updateTrack(geometry, pt)
    return geometry
  }
  //Crossed W => E
  if (crossDirection < 0) {
    //TODO- Interpolate time
    //NOTE - This is untested. Just here to roughly describe what to do
    updateTrack(geometry, [-180, pt.coordinates[1]], crossTime)
    geometry.geometries.push(createTrackPoint([180, pt.coordinates[1]], crossTime))
    updateTrack(geometry, pt)
    return geometry
  }
  */
  //Normal case - Append point to track, update times
  const time = pt.when.start;
  if (segment.times === undefined) console.log("Bad juju:", segment, pt);
  const index = segment.times.findIndex(t => t <= time);
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
    //Update generic GeometryCollection
  }
  return geometry;
};
