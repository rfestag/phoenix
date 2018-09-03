import { updateWhen } from "./common";
import _ from "lodash";

const defaultProperty = {
  type: undefined,
  min: undefined,
  max: undefined,
  first: undefined,
  last: undefined,
  length: 0,
  when: {
    start: undefined,
    end: undefined,
    interval: undefined
  }
};

const findIndex = (data, fn) => {
  //Search backwards through the data. This is because,
  //in the most common cases, the item is close to the end
  for (let i = data.length - 1; i >= 0; i--) {
    if (fn(data[i], i)) return i;
  }
  return -1;
};

const updateAggregations = (prop, value) => {
  let min = value;
  let max = value;
  if (_.isArray(value)) {
    min = _.min(value);
    max = _.max(value);
  }
  //Update min
  if (prop.min) {
    if (prop.min > min) prop.min = min;
  } else {
    prop.min = min;
  }
  //Update max
  if (prop.max) {
    if (prop.max < max) prop.max = max;
  } else {
    prop.max = max;
  }
  //Update first
  prop.first = prop.data[0];
  //Update last
  prop.last =
    prop.data.length > 0 ? prop.data[prop.data.length - 1] : undefined;
  //Update length
  prop.length = prop.data.length;
};

//export const createProperty = (def=defaultProperty) => ({...def, when: {...def.when}})
export const createProperty = def =>
  def ? def : { ...defaultProperty, when: { ...defaultProperty.when } };
export const updateProperty = (prop, value, time) => {
  prop.data = prop.data || [];
  prop.times = prop.times || [];
  if (time) {
    const index = findIndex(prop.data, t => t <= time);
    if (
      index === prop.times.length - 1 &&
      value !== prop.data[prop.data.length - 1]
    ) {
      prop.times.push(time);
      prop.data.push(value);
    } else if (index > 0 && value !== prop.data[prop.data.length - 1]) {
      prop.times.splice(index, 0, time);
      prop.data.splice(index, 0, value);
    } else {
      if (value !== prop.data[prop.data.length - 1]) {
        prop.times.unshift(time);
        prop.data.unshift(value);
      } else {
        prop.times[0] = time;
      }
    }
    updateWhen(prop, time);
    updateAggregations(prop, value);
  } else {
    prop.data.push(value);
  }
  return prop;
};
