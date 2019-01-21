import { TIMING_METRIC, COUNT_METRIC } from "./MetricsActions";
const initialState = {
  start: Date.now(),
  timing: {},
  count: {}
};
export default function(state = initialState, action) {
  const metric = action.metric;
  switch (action.type) {
    case TIMING_METRIC:
      let duration = action.duration;
      let { min, max, avg, count, total } = state.timing[metric] || {
        min: Number.MAX_VALUE,
        max: -Number.MIN_VALUE,
        avg: 0,
        count: 0,
        total: 0
      };
      min = duration < min ? duration : min;
      max = duration > max ? duration : max;
      avg = (avg * count + duration) / (count + 1);
      total += duration;
      count += 1;
      const timing = {
        ...state.timing,
        [metric]: { min, max, avg, count, total }
      };
      return { ...state, timing };
    case COUNT_METRIC:
      const newCount = (state.count[metric] || 0) + action.count;
      const c = { ...state.count, [metric]: newCount };
      return { ...state, count: c };
    default:
      return state;
  }
}
