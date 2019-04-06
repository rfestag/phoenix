import { withLatestFrom, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { deleteFromCollection } from "./CollectionActions";
import { ageoffHistory } from "../entities/entities";
//import { ageoffProperty } from "../entities/properties";
import { ageoffGeometry } from "../entities/geometries";
import _ from "lodash";
import moment from "moment";

export const ageOffEpic = (action$, state$) => {
  return interval(30000).pipe(
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const collections = state.collection.collections;
      let actions = _.reduce(
        collections,
        (actions, collection, id) => {
          console.log("Ageoff", collection.ageoff);
          if (!collection.ageoff || !collection.ageoff.value > 0)
            return actions;
          const ageoff = moment().subtract(
            collection.ageoff.value,
            collection.ageoff.unit
          );
          const ids = _.reduce(
            collection.data,
            (ids, entity, id) => {
              if (!entity.when || !entity.when.start || !entity.when.end)
                return ids;
              const t = entity.when.end || entity.when.start;
              if (t < ageoff) ids.push(id);
              else {
                ageoffHistory(entity, ageoff);
                /*
                _.each(entity.properties, p => {
                  ageoffProperty(p, ageoff);
                });
                */
                _.each(entity.geometries, g => {
                  ageoffGeometry(g, ageoff);
                });
              }
              return ids;
            },
            []
          );
          if (ids.length > 0) actions.push(deleteFromCollection(id, ids));
          return actions;
        },
        []
      );
      return of(...actions);
    })
  );
};
