import _ from "lodash";
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
  BATCH_UPDATE_COLLECTIONS,
  UPDATE_COLLECTION_FIELDS,
  DELETE_FROM_COLLECTION,
  SELECT_ENTITIES,
  SET_SELECTED_ENTITIES,
  SET_CURRENT_COLLECTION,
  SET_FOCUSED_ENTITY
} from "./CollectionActions";
import { updateEntity } from "../entities/entities";
import { getDefaultColumns } from "../columns/Constants";
const initialState = { collections: {} };

function updateCollection(collection, action) {
  let fields = {
    properties: { ...collection.fields.properties },
    geometries: { ...collection.fields.geometries }
  };
  let data = _.reduce(
    action.data,
    (data, updates, id) => {
      const [updatedEntity, updatedFields] = updateEntity(
        data[id],
        updates,
        fields,
        collection.ageoff
      );
      data[id] = updatedEntity;
      fields = updatedFields;
      return data;
    },
    { ...collection.data }
  );
  return { ...collection, fields, data };
}
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
          ageoff: { value: 30, unit: "seconds" },
          name: action.name,
          queries: action.queries,
          visible: true,
          fields: { geometries: {}, properties: getDefaultColumns() },
          selected: {},
          data: {}
        };
        return {
          ...state,
          current: id,
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
    case DELETE_FROM_COLLECTION:
      collection = state.collections[id];
      let data = _.omit(collection.data, action.ids);
      console.log("Deleting", action.ids.length);
      return {
        ...state,
        collections: { ...state.collections, [id]: { ...collection, data } }
      };
    case BATCH_UPDATE_COLLECTIONS:
      const updatedCollections = _.reduce(
        action.allUpdates,
        (collections, action) => {
          const collection = collections[action.id];
          if (collection)
            collections[action.id] = updateCollection(collection, action);
          return collections;
        },
        { ...state.collections }
      );
      return { ...state, collections: updatedCollections };
    case UPDATE_COLLECTION:
      collection = state.collections[id];
      if (collection) {
        collection = updateCollection(collection, action);
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      } else {
        console.error("Cannot update collection (does not exist)", id);
        return state;
      }
    case UPDATE_COLLECTION_FIELDS:
      collection = state.collections[id];
      if (collection) {
        collection = { ...collection, fields: action.fields };
        return {
          ...state,
          collections: { ...state.collections, [id]: collection }
        };
      } else {
        return state;
      }
    case SELECT_ENTITIES:
      collection = state.collections[id];
      if (collection) {
        collection.selected = action.ids.reduce(
          (selected, id) => {
            selected[id] = true;
            return selected;
          },
          { ...collection.selected }
        );
        return {
          ...state,
          collections: { ...state.collections, [id]: { ...collection } }
        };
      } else {
        return state;
      }
    case SET_SELECTED_ENTITIES:
      console.log("Setting selected entities");
      collection = state.collections[id];
      if (collection) {
        collection.selected = action.ids.reduce((selected, id) => {
          selected[id] = true;
          return selected;
        }, {});
        return {
          ...state,
          collections: { ...state.collections, [id]: { ...collection } }
        };
      } else {
        return state;
      }
    case SET_CURRENT_COLLECTION:
      return {
        ...state,
        current: id
      };
    case SET_FOCUSED_ENTITY:
      return {
        ...state,
        collections: {
          ...state.collections,
          [id]: { ...collection, focused: action.eid }
        }
      };
    default:
  }
  return state;
}
