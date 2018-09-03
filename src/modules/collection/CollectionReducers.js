import _ from "lodash";
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_FROM_COLLECTION
} from "./CollectionActions";
import { updateEntity } from "../entities/entities";
const initialState = { collections: {} };

/*
function applyUpdates(entity, updates) {
  let updatedProperties = {};
  return updates.reduce((entity, update) => {
    entity.start = update.time < entity.start ? update.time : entity.start;
    entity.end = update.time > entity.end ? update.time : entity.end;
    if (update.position && update.position.value[0] && update.position.value[1]) {
      const pt = new L.LatLng(update.position.value[1], update.position.value[0]);
      entity.bounds = entity.bounds ? entity.bounds.extend(pt) : pt.toBounds(500)
      entity.position = entity.position.insert(
        update.position,
        update.position.time
      );
    }
    if (update.properties) {
      updatedProperties = _.reduce(
        update.properties,
        (updatedProperties, v, k) => {
          let values = updatedProperties[k]
            ? updatedProperties[k]
            : entity.properties[k]
              ? entity.properties[k]
              : new TimeSeries();
          updatedProperties[k] = values.insert(
            update.properties[k],
            update.properties[k].time
          );
          return updatedProperties;
        },
        updatedProperties
      );
    }
    entity.properties = { ...entity.properties, ...updatedProperties };

    return entity;
  }, entity);
}
*/

export default function(state = initialState, action) {
  const id = action.id;
  let collection;
  switch (action.type) {
    case CREATE_COLLECTION:
      collection = state.collections[id];
      if (collection) {
        console.error("Cannot create collection (already exists)", id);
        return state;
      } else {
        collection = {
          id,
          name: action.name,
          queries: action.queries,
          data: {}
        };
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      }
    case DELETE_COLLECTION:
      const { [id]: deleted, ...collections } = state.collections;
      if (deleted) return { ...state, collections };
      else {
        console.error("Cannot delete collection (does not exist)", id);
        return state;
      }
    case UPDATE_COLLECTION:
      collection = state.collections[id];
      if (collection) {
        console.time("Update Collection");
        let data = _.reduce(
          action.data,
          (data, updates, id) => {
            data[id] = updateEntity(data[id], updates);
            /*
            let entity = data[id]
              ? { ...data[id] }
              : {
                  id: id,
                  start: updates[0].time,
                  end: updates[0].time,
                  position: new TimeSeries(),
                  properties: {}
                };
            data[id] = applyUpdates(entity, updates);
            */
            return data;
          },
          { ...collection.data }
        );
        collection = { ...collection, data };
        console.timeEnd("Update Collection");
        //let keys = Object.keys(data)
        //console.log(data[keys[0]])
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      } else {
        console.error("Cannot update collection (does not exist)", id);
        return state;
      }
    case DELETE_FROM_COLLECTION:
      //TODO: Reimplement
      collection = _.omit(state.collection[action.id], action.ids);
      return {
        ...state,
        collections: { ...state.collections, [action.id]: collection }
      };
    default:
  }
  return state;
}
