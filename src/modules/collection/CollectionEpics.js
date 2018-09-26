import { withLatestFrom, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { deleteFromCollection } from "./CollectionActions";
import _ from "lodash";
import moment from "moment";

export const ageOffEpic = (action$, state$) => {
  console.log(action$, state$);
  return interval(30000).pipe(
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const collections = state.collection.collections;
      const actions = _.reduce(
        collections,
        (actions, collection, id) => {
          if (!collection.ageoff) return actions;
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
              return ids;
            },
            []
          );
          if (ids.length > 0) actions.push(deleteFromCollection(id, ids));
          return actions;
        },
        []
      );
      console.log("Should delete", actions);
      return of(...actions);
    })
  );
};
