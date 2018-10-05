import { concat } from "rxjs/observable/concat";
import { of } from "rxjs/observable/of";
import { ofType } from "redux-observable";
import { filter, map } from "rxjs/operators";
import {
  CANCEL_QUERY,
  RESUME_QUERY,
  DELETE_QUERY,
  PAUSE_QUERY
} from "./QueryActions";

/**
 * An operator that should be applied to a stream of Redux actions. It monitors
 * for a CANCEL_QUERY action on the provided id. It is intended for use in epics.
 *
 * @param {string} id The id of the query to watch for CANCEL_QUERY on
 */
export const queryCancelled = id => {
  return action$ =>
    action$.pipe(
      ofType(DELETE_QUERY, CANCEL_QUERY),
      filter(action => action.id === id)
    );
};

/**
 * An operator that should be applied to a stream of Redux actions. It monitors
 * for RESUME_QUERY and PAUSE_QUERY actions on the provided id, and emits
 * true or false. It is inteded for use in epics
 *
 * @param {string} id The id of the query to watch for RESUME_QUERY/PAUSE_QUERY actions
 * @param {boolean} isPaused The initial state of this operator. Generally, you should pull this directly from the state
 */
export const queryPaused = (id, isPaused) => {
  return action$ =>
    concat(
      of(isPaused),
      action$.pipe(
        ofType(RESUME_QUERY, PAUSE_QUERY),
        filter(action => action.id === id),
        map(action => action.type === PAUSE_QUERY)
      )
    );
};
