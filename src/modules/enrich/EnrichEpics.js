import {
  withLatestFrom,
  mergeMap,
  map,
  filter,
  mergeAll
} from "rxjs/operators";
import { from } from "rxjs/observable/from";
import { ofType } from "redux-observable";
import {
  UPDATE_COLLECTION,
  BATCH_UPDATE_COLLECTIONS
} from "../collection/CollectionActions";
import * as enrichments from "./enrichments";
import _ from "lodash";

export const enrichNewEntitiesEpic = (action$, state$) => {
  let enriched = {};
  return action$.pipe(
    ofType(UPDATE_COLLECTION, BATCH_UPDATE_COLLECTIONS),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      //Get list of actions. BATCH_UPDATE_COLLECTIONS will be an array of them
      let actions =
        action.type === BATCH_UPDATE_COLLECTIONS
          ? action.allUpdates.map(u => u)
          : [action];
      let promises = actions.reduce((promises, action) => {
        let enrich = _.reduce(
          action.data,
          (enrich, update, id) => {
            if (!enriched[id]) {
              enrich[id] = state.collection.collections[action.id].data[id];
            }
            return enrich;
          },
          {}
        );
        enriched = { ...enriched, ...enrich };
        let entities = Object.values(enrich);
        _.each(enrichments, e => {
          promises.push(e(entities, action));
        });
        return promises;
      }, []);
      return from(promises).pipe(
        mergeAll(),
        filter(Boolean),
        map(result => {
          return result;
        })
      );
    })
  );
};
