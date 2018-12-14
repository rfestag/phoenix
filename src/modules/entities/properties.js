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
  //If we have time, sort by it
  if (time) {
    const index = findIndex(prop.data, t => t <= time);
    //If this should be pushed to the last position, only add it if
    //the value hasn't changed
    if (index === prop.times.length - 1) {
      if (value !== prop.data[prop.data.length - 1]) {
        prop.times.push(time);
        prop.data.push(value);
      }
      //If this is somewhere in the middle of the array, put it there unless
      //we already have the value there
    } else if (index > 0) {
      if (value !== prop.data[index]) {
        prop.times.splice(index, 0, time);
        prop.data.splice(index, 0, value);
      }
      //If it is at 0 (the only remaining case), put it at the beginning of the array.
      //If it is the same value as the beginning of the array, just change the first time
    } else {
      if (value !== prop.data[0]) {
        prop.times.unshift(time);
        prop.data.unshift(value);
      } else {
        prop.times[0] = time;
      }
    }
    updateWhen(prop, time);
    //If we don't have time, we just append in natural order
  } else {
    prop.data.push(value);
  }
  updateAggregations(prop, value);
  return prop;
};
export const ageoffProperty = (prop, time) => {
  const index = prop.data.find(t => t >= time);
  prop.data = prop.data.slice(index);
  return prop;
};
