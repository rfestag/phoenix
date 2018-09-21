import _ from "lodash";
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_FROM_COLLECTION
} from "./CollectionActions";
import { updateEntity } from "../entities/entities";
const initialState = { collections: {} };

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
          visible: true,
          fields: { geometries: {}, properties: {} },
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
        //console.time("Update Collection");
        console.time("update entities");
        const fields = {
          properties: { ...collection.fields.properties },
          geometries: { ...collection.fields.geometries }
        };
        let data = _.reduce(
          action.data,
          (data, updates, id) => {
            const [updatedEntity, updatedFields] = updateEntity(
              data[id],
              updates,
              fields
            );
            data[id] = updatedEntity;
            collection.fields = updatedFields;
            return data;
          },
          { ...collection.data }
        );
        console.timeEnd("update entities");
        collection = { ...collection, fields, data };
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
