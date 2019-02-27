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
  DELETE_QUERY
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
  filter,
  map,
  mergeMap,
  switchMap,
  buffer,
  mergeAll,
  pipe
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
        const adapter = sourceAdapter.query(action.query);
        const dictionary = sourceAdapter.dictionary(action.query);
        const id = action.id;
        const name = action.name || id;
        const source = new ReplaySubject(1); //We use a replay subject so that, on unpause, we immediately emit the current value
        const buffered = new Subject(); //Our buffer of data during pause

        const isComplete = action$.pipe(queryCancelled(id));

        const pauseQuery = action$.pipe(queryPaused(id, false));

        //We separate the query's observable from the source because we assume it 'cold',
        //and we don't want to restart it on subscription
        adapter
          .pipe(
            map(d => {
              d.provider = action.source;
              return d;
            }),
            bufferTime(2000),
            filter(d => d.length > 0),
            collectBy(d => d.id)
          )
          .subscribe(source);
        source.pipe(buffer(pauseQuery), mergeAll()).subscribe(buffered);

        const collectionId = uuid();
        return concat(
          of(
            createCollection(collectionId, name),
            updateCollectionFields(collectionId, dictionary)
          ),
          pauseQuery.pipe(
            switchMap(paused => (paused ? buffered : source)),
            map(data => updateCollection(collectionId, id, data)),
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
  const bcast = new BroadcastChannel("query");

  port.onmessage = function(e) {
    action$.next(JSON.parse(e.data));
  };

  action$
    .pipe(
      ofType(CREATE_QUERY),
      mapToCollection(action$)
      /*
      bufferTime(1000),
      filter(d => d.length > 0),
      map(actions => {
        const updates = actions.filter(a => a.type === UPDATE_COLLECTION);
        const others = actions.filter(a => a.type !== UPDATE_COLLECTION);
        return others.concat(batchUpdateCollections(updates));
      }),
      mergeAll()
      */
    )
    .subscribe(updates => bcast.postMessage(JSON.stringify(updates)));
};
