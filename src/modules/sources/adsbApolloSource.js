import { ApolloWsSource } from "./apolloWsSource";
import { map, interval } from "rxjs/operators";
import { Observable } from "rxjs";
import { createTrackPoint } from "../entities/geometries";
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
