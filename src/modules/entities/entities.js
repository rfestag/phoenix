//import { createProperty, updateProperty } from "./properties";
import { createGeometry, updateGeometry } from "./geometries";
import { updateWhen } from "./common";
import {
  createPropertyColumn,
  createGeometryColumn
} from "../columns/Constants";

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
  let entity = createEntity(e);
  for (let i = 0; i < updates.length; i++) {
    let u = updates[i];
    //}
    //const entity = updates.reduce((entity, update) => {
    if (!entity.id) entity.id = u.id;
    if (!entity.label) entity.label = u.label;
    if (!entity.provider) entity.provider = u.provider;

    if (u.properties) {
      let properties = entity.properties || {};
      let updatedProperties = Object.keys(u.properties);
      for (let p = 0; p < updatedProperties.length; p++) {
        let field = updatedProperties[p];
        let prop = u.properties[field];
        const { value, time } = prop;
        if (properties[field]) {
          if (properties[field].time < time) {
            properties[field] = prop;
          }
        } else {
          properties[field] = prop;
        }
        updateWhen(entity, time);
        if (!fields.properties[field]) {
          let idx = Object.keys(fields.properties).length;
          fields.properties[field] = createPropertyColumn(field, value);
          fields.properties[field].position = idx;
        }
      }
      entity.properties = properties;
    }
    if (u.geometries) {
      let geometries = entity.geometries || {};
      let updatedGeometries = Object.keys(u.geometries);
      for (let g = 0; g < updatedGeometries.length; g++) {
        let field = updatedGeometries[g];
        let update = u.geometries[field];
        const prop = geometries[field] ? geometries[field] : createGeometry();
        updateWhen(entity, update.when.end || update.when.start);
        geometries[field] = updateGeometry(prop, update);
        geometries[field].eid = entity.id;
        if (!fields.geometries[field])
          fields.geometries[field] = createGeometryColumn(field, update);
      }
      entity.geometries = geometries;
      /*
      _.reduce(
        update.geometries,
        (updatedGeometries, update, field) => {
          const prop = updatedGeometries[field]
            ? updatedGeometries[field]
            : createGeometry(entity.geometries[field]);
          updateWhen(entity, update.when.end || update.when.start);
          updatedGeometries[field] = updateGeometry(prop, update);
          updatedGeometries[field].eid = entity.id;
          if (!fields.geometries[field])
            fields.geometries[field] = createGeometryColumn(field, update);
          return updatedGeometries;
        },
        entity.geometries
      );
      */
    }
    entity.history.push({ update: u, time: entity.when.end });

    //  return entity;
    //}, createEntity(e));
  }
  return [entity, fields];
};
