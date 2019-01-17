import { WebsocketSource } from "./websocketSource";
import { map } from "rxjs/operators";
import _ from "lodash";

/**
 * Connects to a websocket providing JSON data from ADSBExchange
 * @class {ADSBSource}
 */
export class ADSBSource extends WebsocketSource {
  /**
   * Constructor for ADSBSource. It takes the same parameters as WebsocketSource
   */
  constructor(def = {}) {
    super("ADSB", { url: "wss://localhost:3001", ...def });
  }

  /**
   * Take the query definition, completely ignore it, and connect to a websocket that pipes
   * ADSB Exchange live aircraft locations. Normalize those updates to our internal format.
   * @param {Object} def An object representing the query to execute
   * @return {Object} An RXJS Observable stream of *batches* of results.
   */
  query(def) {
    //NOTE: This doesn't pay attention to the query definition
    return this.messages.pipe(
      map(updates => {
        return updates.map(d => {
          const time = d.PosTime * 1000;
          const position = { time, value: [d.Long, d.Lat] };
          const properties = _.reduce(
            d,
            (update, value, k) => {
              if (k === "PosTime") return update;
              //const type = _.isNumber(value) ? "numeric" : "string";
              //update[k] = { time, value, type };
              update[k] = { time, value };
              return update;
            },
            {}
          );

          return {
            id: d.Icao,
            label: d.Icao,
            time,
            position,
            properties
          };
        });
      })
    );
  }
}
