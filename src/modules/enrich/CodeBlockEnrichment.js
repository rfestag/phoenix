import { withLatestFrom, mergeMap } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { interval } from "rxjs/observable/interval";
import { ofType } from "redux-observable";
import { ENRICH_ENTITY } from "./EnrichActions";

import _ from "lodash";
import adsbClient from "../../clients/adsbApollo";

export const CodeBlockEnrichment = (action$, state$) => {
  let enriched = {};
  return action$.pipe(
    ofType(ENRICH_ENTITY, BATCH_UPDATE_COLLECTIONS),
    mergeMap(action => {
      console.log("Enrich", action);
      return [];
    })
  );
};
