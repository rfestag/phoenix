import { ApolloWsSource } from "./apolloWsSource";
import { map, interval } from "rxjs/operators";
import { Observable } from "rxjs";
import { createTrackPoint } from "../entities/geometries";
import { createPropertyColumn, getDefaultColumns } from "../columns/Constants";
import gql from "graphql-tag";
import _ from "lodash";

/**
 * Connects to a websocket providing JSON data from ADSBExchange
 * @class {ADSBApolloSource}
 */
export class ADSBApolloSource extends ApolloWsSource {
  /**
   * Constructor for ADSBApolloSource. It takes the same parameters as WebsocketSource
   */
  constructor(def = {}) {
    super("ADSB Apollo", {
      uri: "http://localhost:4000/graphql",
      wsUri: "ws://localhost:4000/subscriptions",
      ...def
    });
  }

  /**
   * Returns default column definitions for fields. If you want to provide descriptions and units for
   * data, use this method.
   * TODO: Provide more details on the supported types and additional options
   */
  dictionary(def) {
    //Ignore def, use static dictionary
    return {
      geometries: {},
      properties: {
        Sig: createPropertyColumn("Sig", 0, {
          _range: [0, 255],
          _description:
            "The signal level for the last message received from the aircraft, as reported by the receiver. Not all receivers pass signal levels. The value’s units are receiver-dependent."
        }),
        Icao: createPropertyColumn("Icao", "", {
          hide: false,
          _description:
            "This is the six-digit hexadecimal identifier broadcast by the aircraft over the air in order to identify itself."
        }),
        Alt: createPropertyColumn("Alt", 0, {
          hide: false,
          _unitType: "distance",
          _unit: "feet",
          _description:
            " The altitude in feet at standard pressure. (broadcast by the aircraft)"
        }),
        GAlt: createPropertyColumn("GAlt", 0, {
          hide: false,
          _unitType: "distance",
          _unit: "feet",
          _description:
            " The altitude adjusted for local air pressure, should be roughly the height above mean sea level."
        }),
        AltT: createPropertyColumn("AltT", true, {
          _description:
            "The type of altitude transmitted by the aircraft: 0 = standard pressure altitude, 1 = indicated altitude (above mean sea level). Default to standard pressure altitude until told otherwise."
        }),
        Lat: createPropertyColumn("Lat", 0, {
          hide: false,
          _unitType: "latitude",
          _unit: "degrees"
        }),
        Long: createPropertyColumn("Long", 0, {
          hide: false,
          _unitType: "longitude",
          _unit: "degrees"
        }),
        Mlat: createPropertyColumn("Mlat", true),
        Spd: createPropertyColumn("Spd", 0, {
          hide: false,
          _unitType: "speed",
          _unit: "knots"
        }),
        Trak: createPropertyColumn("Trak", 0, {
          _unitType: "orientation",
          _unit: "degrees"
        }),
        Vsi: createPropertyColumn("Vsi", 0, {
          _unitType: "speed",
          _unit: "fps"
        }),
        CallSus: createPropertyColumn("CallSus", true),
        Sqk: createPropertyColumn("Sqk", 0),
        Sat: createPropertyColumn("Sat", 0),
        TAlt: createPropertyColumn("TAlt", 0),
        Help: createPropertyColumn("Help", true),
        VsiT: createPropertyColumn("VsiT", 0),
        InHg: createPropertyColumn("InHg", 0),
        TTrk: createPropertyColumn("TTrk", 0),
        Gnd: createPropertyColumn("Gnd", true),
        Call: createPropertyColumn("Call", ""),
        Tisb: createPropertyColumn("Tisb", true),
        TrkH: createPropertyColumn("TrkH", true),
        SpdTyp: createPropertyColumn("SpdTyp", 0),
        Trt: createPropertyColumn("Trt", 0),
        ...getDefaultColumns()
      }
    };
  }

  /**
   * Take the query definition, completely ignore it, and connect to a websocket that pipes
   * ADSB Exchange live aircraft locations. Normalize those updates to our internal format.
   * @param {Object} def An object representing the query to execute
   * @return {Object} An RXJS Observable stream of *batches* of results.
   */
  query(def) {
    return new Observable(observer => {
      const query = gql`
        subscription {
          update {
            updates {
              id
              time
              payload
            }
          }
        }
      `;
      //TODO: need to know how to complete
      this.client
        .subscribe({
          query,
          variables: {}
        })
        .subscribe({
          next(data) {
            if (data.errors) {
              console.error(data.errors);
              observer.error(data.errors);
            } else {
              observer.next(
                _.map(data.data.update.updates, update => {
                  const d = JSON.parse(update.payload);
                  const id = update.id;
                  const time = update.time;
                  let geometries = undefined;
                  if (d.Long && d.Lat)
                    geometries = {
                      track: createTrackPoint([d.Long, d.Lat], time)
                    };
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
                    id,
                    label: id,
                    time,
                    geometries,
                    properties
                  };
                })
              );
            }
          }
        });
    });
  }
}
