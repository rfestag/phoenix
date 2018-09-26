import _ from "lodash";
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
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
    case UPDATE_COLLECTION:
      collection = state.collections[id];
      if (collection) {
        //console.time("Update Collection");
        console.time("update entities");
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
              fields
            );
            data[id] = updatedEntity;
            fields = updatedFields;
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
    case UPDATE_COLLECTION_FIELDS:
      collection = state.collections[id];
      if (collection) {
        console.log("UPDATED FIELDS", collection.fields, action.fields);
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
        console.log(collection.selected);
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
