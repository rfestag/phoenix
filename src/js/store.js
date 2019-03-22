import { createEpicMiddleware } from "redux-observable";
import { createStore, applyMiddleware } from "redux";
import { combineReducers } from "redux";
import { combineEpics } from "redux-observable";
import collection from "../modules/collection/CollectionReducers";
import { ageOffEpic } from "../modules/collection/CollectionEpics";
import { enrichNewEntitiesEpic } from "../modules/enrich/EnrichEpics";
import { manageSettings } from "../modules/settings/SettingsEpics";
import { manageMapState } from "../modules/map/MapEpics";
import map from "../modules/map/MapReducers";
import panel from "../modules/panel/PanelReducers";
import metrics from "../modules/metrics/MetricsReducers";
import modal from "../modules/modal/ModalReducers";
import settings from "../modules/settings/SettingsReducers";
import query, { sharedWorkerProxyEpic } from "../modules/query/QueryReducers";
import { timeActionsMiddleware } from "../modules/metrics/MetricsMiddleware";
//import query, { queryEpic, sharedWorkerProxyEpic } from "../modules/query/QueryReducers";

export const rootEpic = combineEpics(
  sharedWorkerProxyEpic,
  ageOffEpic,
  //enrichNewEntitiesEpic,
  manageSettings,
  manageMapState
);
//export const rootEpic = combineEpics(sharedWorkerProxyEpic, ageOffEpic);

const rootReducer = combineReducers({
  collection,
  map,
  metrics,
  modal,
  panel,
  query,
  settings
});

const epicMiddleware = createEpicMiddleware();
const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware, timeActionsMiddleware)
);
epicMiddleware.run(rootEpic);

export default store;
