import BroadcastChannel from "broadcast-channel";
import uuid from "uuid/v4";
import { Subject, ReplaySubject } from "rxjs";
import { concat } from "rxjs/observable/concat";
import { of } from "rxjs/observable/of";
import { empty } from "rxjs/observable/empty";
import { ofType } from "redux-observable";
import { queryPaused, queryCancelled } from "./QueryOperators";
import * as sources from "../sources/SourceMap";
import {
  CREATE_QUERY,
  RESUME_QUERY,
  PAUSE_QUERY,
  CANCEL_QUERY,
  DELETE_QUERY,
  cancelQuery
} from "./QueryActions";
import {
  UPDATE_COLLECTION,
  createCollection,
  updateCollection,
  batchUpdateCollections,
  updateCollectionFields
} from "../collection/CollectionActions";
import {
  tap,
  scan,
  bufferTime,
  bufferToggle,
  takeUntil,
  takeWhile,
  filter,
  map,
  mergeMap,
  switchMap,
  buffer,
  mergeAll,
  pipe,
  catchError
} from "rxjs/operators";
import "babel-polyfill";
import _ from "lodash";

export function collectBy(field) {
  return source => {
    return source.pipe(
      filter(events => events.length > 0),
      map(events =>
        //Events is an array of batched outputs from the source
        events.reduce(
          (grouped, updates) =>
            //Updates is an individual array of bached outputs
            updates.reduce((grouped, d) => {
              grouped[d.id] = grouped[d.id] || [];
              grouped[d.id].push(d);
              return grouped;
            }, grouped),
          {}
        )
      )
    );
  };
}
export function mapToCollection(action$) {
  return function mapToCollectionImplementation(src) {
    return src.pipe(
      mergeMap(action => {
        const sourceAdapter = _.find(sources, s => s.name === action.source);
        console.log("Source adapter", sourceAdapter, action.source, sources);
        const adapter = sourceAdapter.query(action.query, action);
        const dictionary = sourceAdapter.dictionary(action.query);
        const id = action.id;
        const name = action.name || id;
        const source = new ReplaySubject(1); //We use a replay subject so that, on unpause, we immediately emit the current value
        const buffered = new Subject(); //Our buffer of data during pause
        const isComplete = action$.pipe(queryCancelled(id));
        const pauseQuery = action$.pipe(queryPaused(id, false));

        //We separate the query's observable from the source because we assume it 'cold',
        //and we don't want to restart it on subscription
        const collectionId = uuid();
        concat(
          adapter.pipe(
            map(d => {
              d.provider = action.source;
              return d;
            }),
            bufferTime(1000),
            filter(d => d.length > 0),
            collectBy(d => d.id),
            map(data => updateCollection(collectionId, id, data)),
            takeUntil(isComplete)
          ),
          of(cancelQuery(action.id, `Completed Successfully`))
        ).subscribe(source);

        const pausable = pauseQuery.pipe(
          switchMap(
            paused =>
              paused ? source.pipe(buffer(pauseQuery), mergeAll()) : source
          ),
          takeUntil(isComplete)
        );
        return concat(
          of(
            createCollection(collectionId, name, [action.id], action.ageoff),
            updateCollectionFields(collectionId, dictionary)
          ),
          pausable
        ).pipe(
          catchError(e =>
            of(cancelQuery(action.id, `Completed with error: ${e}`))
          )
        );
      })
    );
  };
}

const action$ = new Subject();
const bcast = new BroadcastChannel("query");

action$
  .pipe(
    ofType(CREATE_QUERY),
    mapToCollection(action$),
    bufferTime(1000),
    filter(d => d.length > 0),
    map(actions => {
      const updates = actions.filter(a => a.type === UPDATE_COLLECTION);
      const others = actions.filter(a => a.type !== UPDATE_COLLECTION);
      return others.concat(batchUpdateCollections(updates));
    })
    //mergeAll()
  )
  .subscribe(updates => bcast.postMessage(JSON.stringify(updates)));

console.log("Worker", self);
self.addEventListener("message", e => {
  action$.next(JSON.parse(e.data));
});
