import { Source } from "./source";
import { interval } from "rxjs";
import { map, take } from "rxjs/operators";
import { createTrackPoint } from "../entities/geometries";
import uuid from "uuid/v4";
import _ from "lodash";
import { createPropertyColumn, getDefaultColumns } from "../columns/Constants";
import {
  DISTANCE,
  FEET,
  SPEED,
  KNOTS,
  FEET_PER_SECOND,
  LATITUDE,
  LONGITUDE,
  ROTATION,
  DEGREES
} from "./Constants";

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
  query({ count = 500, iterations = 30, shapeTypes = ["None", "Track"] }) {
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
    return interval(2000).pipe(
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
            let speed = entity.speed || getRandomBetween(0, 500);

            lat += getRandomBetween(-0.5, 0.5);
            lng += getRandomBetween(-0.5, 0.5);
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
        /*
        const data = [];
        for (let i = 0; i < 100; i++) {
          let time = Date.now();
          let lat = { time, value: Math.random() * 180 - 90 };
          let lng = { time, value: Math.random() * 360 - 180 };
          let alt = { time, value: Math.random() * 50000 };
          let geometries = {
            track: createTrackPoint([lng.value, lat.value], time)
          };

          data[i] = {
            id: i,
            label: i,
            time,
            geometries,
            properties: { lat, lng, Alt: alt }
          };
        }
        return data;
        */
      }),
      take(iterations)
    );
  }
}
