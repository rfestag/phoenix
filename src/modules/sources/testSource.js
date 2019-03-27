import { Source } from "./source";
import { interval } from "rxjs";
import { map, take } from "rxjs/operators";
import * as turf from "@turf/turf";
import {
  createTrackPoint,
  createLineString,
  createCircle,
  createSector,
  createPolygon,
  createRing
} from "../entities/geometries";
import uuid from "uuid/v4";
import _ from "lodash";
import { createPropertyColumn, getDefaultColumns } from "../columns/Constants";
import { SPEED, KNOTS, LATITUDE, LONGITUDE } from "./Constants";

function fakestr() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Connects to a websocket providing JSON data from ADSBExchange
 * @class {TestSource}
 */
export class TestSource extends Source {
  /**
   * Constructor for Test source.
   */
  constructor(def = {}) {
    super("Test");
  }

  dictionary(def) {
    return {
      properties: {
        lat: createPropertyColumn("lat", 0, {
          hide: false,
          _unitType: LATITUDE
        }),
        lng: createPropertyColumn("lng", 0, {
          hide: false,
          _unitType: LONGITUDE
        }),
        speed: createPropertyColumn("speed", 0, {
          hide: false,
          _unitType: SPEED,
          _unit: KNOTS
        }),
        prop1: createPropertyColumn("prop1", "", { hide: false }),
        ...getDefaultColumns()
      }
    };
  }

  /**
   * Take the query definition, completely ignore it, and return a stream of random
   * locations for 1000 entities every second.
   * @param {Object} def An object representing the query to execute
   * @return {Object} An RXJS Observable stream of *batches* of results.
   */
  query({
    count = 100,
    iterations = 30,
    shapeTypes = ["None", "Track", "LineString", "Circle", "Sector", "Polygon"]
  }) {
    let entities = {};
    for (let i = 0; i < count; i++) {
      let id = uuid();
      entities[id] = {
        id: id,
        label: i,
        gtype: shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
      };
    }

    console.log("Generating fake data");
    return interval(500).pipe(
      map(v => {
        return _.reduce(
          entities,
          (data, entity) => {
            let id = entity.id;
            let label = entity.label;
            let time = Date.now();
            let properties = {};
            let geometries = {};
            let lat = entity.lat || getRandomBetween(-80, 80);
            let lng = entity.lng || getRandomBetween(-170, 170);
            let alt = entity.alt || getRandomBetween(0, 50000);
            let r1 = getRandomBetween(10000, 50000);
            let r2 = getRandomBetween(51000, 60000);
            let a1 = getRandomBetween(0, 350);
            let a2 = a1 + getRandomBetween(10, 90);
            let speed = entity.speed || getRandomBetween(0, 500);

            lat += getRandomBetween(-0.25, 0.25);
            lng += getRandomBetween(-0.25, 0.25);
            alt += getRandomBetween(-1, 2);
            speed += getRandomBetween(-3, 1);

            if (entity.gtype === "Track") {
              entity.lat = lat;
              entity.lng = lng;
              entity.alt = alt;
              geometries.track = createTrackPoint([lng, lat], time);
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
              properties.alt = { time, value: alt };
              properties.speed = { time, value: speed };
            }
            if (entity.gtype === "Circle") {
              entity.lat = lat;
              entity.lng = lng;
              geometries.circle = createCircle(
                [lng, lat],
                r1,
                time,
                time - 3000
              );
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
              properties.radius = { time, value: r1 };
            }
            if (entity.gtype === "Sector") {
              entity.lat = lat;
              entity.lng = lng;
              entity.alt = alt;
              geometries.sector = createSector(
                [lng, lat],
                r1,
                a1,
                a2,
                time,
                time - 3000
              );
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
              properties.radius = { time, value: r1 };
              properties.bearing1 = { time, value: a1 };
              properties.bearing2 = { time, value: a2 };
            }
            if (entity.gtype === "Polygon") {
              let feature = turf.randomPolygon(1, {
                max_radial_length: 1,
                bbox: [lng - 1, lat - 1, lng + 1, lat + 1]
              }).features[0];
              let coords = feature.geometry.coordinates;
              geometries.polygon = createPolygon(coords, time, time - 3000);
              lat = geometries.polygon.center[1];
              lng = geometries.polygon.center[0];
              entity.lat = lat;
              entity.lng = lng;
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
            }
            if (entity.gtype === "LineString") {
              let feature = turf.randomLineString(1, {
                bbox: [lng - 1, lat - 1, lng + 1, lat + 1],
                max_length: 0.25
              }).features[0];
              let coords = feature.geometry.coordinates;
              geometries.line = createLineString(coords, time, time - 3000);
              lat = geometries.line.coordinates[0][1];
              lng = geometries.line.coordinates[0][0];
              entity.lat = lat;
              entity.lng = lng;
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
            }
            if (entity.gtype === "Ring") {
              entity.lat = lat;
              entity.lng = lng;
              entity.alt = alt;
              geometries.ring = createRing(
                [lng, lat],
                r1,
                r2,
                time,
                time - 3000
              );
              properties.lat = { time, value: lat };
              properties.lng = { time, value: lng };
              properties.innerRadius = { time, value: r1 };
              properties.outerRadius = { time, value: r2 };
            }
            properties.prop1 = { time, value: fakestr() };
            properties.prop2 = { time, value: fakestr() };
            properties.prop3 = { time, value: fakestr() };

            data.push({
              id,
              label,
              time,
              geometries,
              properties
            });
            return data;
          },
          []
        );
      }),
      take(iterations)
    );
  }
}
