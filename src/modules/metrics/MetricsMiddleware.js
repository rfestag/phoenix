import { emitTimingMetric } from "./MetricsActions";

export const timeActionsMiddleware = store => next => action => {
  const start = Date.now();
  const result = next(action);
  if (!action.type.startsWith("METRIC"))
    next(emitTimingMetric(action.type, Date.now() - start));
  return result;
};
