import { createProperty, updateProperty } from "./properties";
import { createGeometry, updateGeometry } from "./geometries";
import { updateWhen } from "./common";
import _ from "lodash";

const defaultEntity = {
  id: undefined,
  label: undefined,
  geometries: {},
  properties: {},
  when: {
    start: undefined,
    end: undefined,
    type: "Interval"
  }
};

export const createEntity = (def = defaultEntity) => ({
  ...def,
  when: { ...def.when }
});
export const updateEntity = (e, updates) => {
  const entity = updates.reduce((entity, update) => {
    if (!entity.id) entity.id = update.id;
    if (!entity.label) entity.label = update.label;

    if (update.properties) {
      let updatedProperties = _.reduce(
        update.properties,
        (updatedProperties, update, field) => {
          const { value, time } = update;
          const prop = updatedProperties[field]
            ? updatedProperties[field]
            : createProperty(entity.properties[field]);
          updatedProperties[field] = updateProperty(prop, value, time);
          updateWhen(entity, time);
          return updatedProperties;
        },
        {}
      );
      entity.properties = { ...entity.properties, ...updatedProperties };
    }
    if (update.geometries) {
      let updatedGeometries = _.reduce(
        update.geometries,
        (updatedGeometries, update, field) => {
          const prop = updatedGeometries[field]
            ? updatedGeometries[field]
            : createGeometry(entity.geometries[field]);
          updatedGeometries[field] = updateGeometry(prop, update);
          updateWhen(entity, update.when.end || update.when.start);
          return updatedGeometries;
        },
        {}
      );
      entity.geometries = { ...entity.geometries, ...updatedGeometries };
    }

    return entity;
  }, createEntity(e));
  return entity;
};
