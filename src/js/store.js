import { createEpicMiddleware } from "redux-observable";
import { createStore, applyMiddleware } from "redux";
import { combineReducers } from "redux";
import { combineEpics } from "redux-observable";
import collection from "../modules/collection/CollectionReducers";
import { ageOffEpic } from "../modules/collection/CollectionEpics";
import map from "../modules/map/MapReducers";
import panel from "../modules/panel/PanelReducers";
import metrics from "../modules/metrics/MetricsReducers";
import query, { sharedWorkerProxyEpic } from "../modules/query/QueryReducers";
import { timeActionsMiddleware } from "../modules/metrics/MetricsMiddleware";
//import query, { queryEpic, sharedWorkerProxyEpic } from "../modules/query/QueryReducers";

export const rootEpic = combineEpics(sharedWorkerProxyEpic, ageOffEpic);

const rootReducer = combineReducers({
  collection,
  map,
  metrics,
  panel,
  query
});

const epicMiddleware = createEpicMiddleware();
const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware, timeActionsMiddleware)
);
epicMiddleware.run(rootEpic);

export default store;
