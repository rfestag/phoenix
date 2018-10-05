/* Types */
export const TIMING_METRIC = "TIMING_METRIC";
export const COUNT_METRIC = "COUNT_METRIC";

/* Actions */
export const emitTimingMetric = (metric, duration) => ({
  type: TIMING_METRIC,
  metric,
  duration
});
export const emitCountMetric = (metric, count) => ({
  type: COUNT_METRIC,
  metric,
  count
});
