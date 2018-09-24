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
  CANCEL_QUERY
} from "./QueryActions";
import {
  createCollection,
  updateCollection
} from "../collection/CollectionActions";
import {
  tap,
  scan,
  bufferTime,
  bufferToggle,
  takeUntil,
  filter,
  map,
  mergeMap,
  switchMap,
  buffer,
  mergeAll,
  pipe
} from "rxjs/operators";
import "babel-polyfill";

export function collectBy(field) {
  return source => {
    return source.pipe(
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
        const adapter = sources[action.source].query(action.query);
        const id = action.id;
        const name = action.name || id;
        const source = new ReplaySubject(1); //We use a replay subject so that, on unpause, we immediately emit the current value
        const buffered = new Subject(); //Our buffer of data during pause

        const isComplete = action$.pipe(queryCancelled(id));

        const pauseQuery = action$.pipe(queryPaused(id, false));

        //We separate the query's observable from the source because we assume it 'cold',
        //and we don't want to restart it on subscription
        adapter.pipe(bufferTime(3000), collectBy(d => d.id)).subscribe(source);
        source.pipe(buffer(pauseQuery), mergeAll()).subscribe(buffered);

        const collectionId = uuid();
        return concat(
          of(createCollection(collectionId, name)),
          pauseQuery.pipe(
            switchMap(paused => (paused ? buffered : source)),
            map(data => updateCollection(collectionId, data)),
            takeUntil(isComplete)
          )
        );
      })
    );
  };
}

self.onconnect = function(e) {
  const action$ = new Subject();
  var port = e.ports[0];
  port.onmessage = function(e) {
    action$.next(JSON.parse(e.data));
  };

  action$
    .pipe(ofType(CREATE_QUERY), mapToCollection(action$))
    .subscribe(updates => port.postMessage(JSON.stringify(updates)));
};
