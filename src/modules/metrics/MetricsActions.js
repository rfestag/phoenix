/* Types */
export const TIMING_METRIC = "METRIC_TIMING";
export const COUNT_METRIC = "METRIC_COUNT";

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
