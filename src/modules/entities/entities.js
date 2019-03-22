import { createProperty, updateProperty } from "./properties";
import { createGeometry, updateGeometry } from "./geometries";
import { updateWhen } from "./common";
import {
  createPropertyColumn,
  createGeometryColumn
} from "../columns/Constants";
import _ from "lodash";

const defaultEntity = {
  id: undefined,
  label: undefined,
  geometries: {},
  properties: {},
  history: [],
  when: {
    start: undefined,
    end: undefined,
    type: "Interval"
  }
};

/*
export const createEntity = (def = defaultEntity) => ({
  ...def,
  geometries: {...def.geometries},
  properties: {...def.properties},
  when: { ...def.when }
});
*/
export const createEntity = def => {
  return def
    ? def
    : {
        ...defaultEntity,
        geometries: {},
        properties: {},
        history: [],
        when: { ...defaultEntity.when }
      };
};
export const ageoffHistory = (entity, time) => {
  const index = entity.history.findIndex(u => u.time >= time);
  //If more than one observation is old, remove up to the index
  //This will ensure that no more than one observation was first seen before the ageoff.
  //This is useful in cases we want to interpolate the value at the ageoff time later.
  if (index > 1) {
    entity.history.splice(0, index - 1);
    entity.when.start = entity.history[0].time;
  }
  return entity;
};
export const updateEntity = (e, updates, fields) => {
  const entity = updates.reduce((entity, update) => {
    if (!entity.id) entity.id = update.id;
    if (!entity.label) entity.label = update.label;
    if (!entity.provider) entity.provider = update.provider;

    if (update.properties) {
      entity.properties = _.reduce(
        update.properties,
        (properties, update, field) => {
          if (properties[field]) {
            if (properties[field].time < update.time) {
              properties[field] = update;
            }
          } else {
            properties[field] = update;
          }
          updateWhen(entity, update.time);
          return properties;
        },
        entity.properties || {}
      );

      //Mutable version
      /*
      let updatedProperties = _.reduce(
        update.properties,
        (updatedProperties, update, field) => {
          const { value, time } = update;
          const prop = updatedProperties[field]
            ? updatedProperties[field]
            : createProperty(entity.properties[field]);
          updatedProperties[field] = updateProperty(prop, value, time);
          updateWhen(entity, time);
          if (!fields.properties[field]) {
            let idx = Object.keys(fields.properties).length;
            fields.properties[field] = createPropertyColumn(field, value);
            fields.properties[field].position = idx;
          }
          return updatedProperties;
        },
        entity.properties
      );
      */
    }
    if (update.geometries) {
      //Mutable version
      let updatedGeometries = _.reduce(
        update.geometries,
        (updatedGeometries, update, field) => {
          const prop = updatedGeometries[field]
            ? updatedGeometries[field]
            : createGeometry(entity.geometries[field]);
          updateWhen(entity, update.when.end || update.when.start);
          updatedGeometries[field] = updateGeometry(prop, update);
          if (!fields.geometries[field])
            fields.geometries[field] = createGeometryColumn(field, update);
          return updatedGeometries;
        },
        entity.geometries
      );
    }
    entity.history.push({ update, time: entity.when.end });

    return entity;
  }, createEntity(e));
  return [entity, fields];
};
