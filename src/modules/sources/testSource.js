import { Source } from "./source";
import { Observable } from "rxjs";
import { createTrackPoint } from "../entities/geometries";

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

  /**
   * Take the query definition, completely ignore it, and return a stream of random
   * locations for 1000 entities every second.
   * @param {Object} def An object representing the query to execute
   * @return {Object} An RXJS Observable stream of *batches* of results.
   */
  query(def) {
    return Observable.interval(1000).map(v => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        let time = Date.now();
        let lat = { time, value: Math.random() * 180 - 90 };
        let lng = { time, value: Math.random() * 360 - 180 };
        let alt = { time, value: Math.random() * 50000 };
        let position = { time, value: [lng.value, lat.value] };
        let geometries = {
          track: createTrackPoint([lng, lat], time)
        };

        data[i] = {
          id: i,
          label: i,
          time,
          position,
          properties: { lat, lng, Alt: alt }
        };
      }
      return data;
    });
  }
}
