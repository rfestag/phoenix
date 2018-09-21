import { createSelector } from "reselect";
import ValueRenderer from "./ValueRenderer";
import moment from "moment";
import _ from "lodash";

const SELECT_COLUMN = {
  checkboxSelection: true,
  pinned: true,
  suppressMenu: true,
  headerCheckboxSelection: true,
  width: 40,
  suppressResize: true,
  suppressSizeToFit: true
};

export const GETTERS = {
  latestValueGetter: params => {
    if (params.data.properties[params.colDef.field] === undefined)
      return undefined;
    return params.data.properties[params.colDef.field].last;
  },
  timeGetter: params => {
    return params.data.when[params.colDef.field];
  }
};
export const FORMATTERS = {
  timeFormatter: params => {
    if (params === undefined || params.value === undefined) return undefined;
    return moment(params.value)
      .utc()
      .format();
  }
};

export const getDefaultColumns = () => {
  return [
    {
      headerName: "First seen",
      field: "start",
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    },
    {
      headerName: "Last seen",
      field: "end",
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    }
  ];
};
export const createPropertyColumn = (field, value) => {
  if (value) {
    if (_.isArray(value)) createPropertyColumn(field, value[0]);
    if (_.isNumber(value)) {
      return {
        field,
        headerName: field,
        hide: true,
        _type: "numeric",
        _unitType: undefined,
        _units: undefined,
        _getterName: "latestValueGetter"
      };
    } else {
      return {
        field,
        headerName: field,
        hide: true,
        _type: "string",
        _getterName: "latestValueGetter"
      };
    }
  } else {
    return {
      field,
      headerName: field,
      hide: true,
      _type: undefined,
      _getterName: "latestValueGetter"
    };
  }
};
export const createGeometryColumn = (field, value) => {};
export const getPropertiesForCollection = (state, props) => {
  if (props.collection) {
    return props.collection.fields.properties;
  }
  return {};
};
export const getGeometriesForCollection = (state, props) => {
  if (props.collection) {
    return props.collection.fields.geometries;
  }
  return {};
};

export const getColumnDefs = createSelector(
  [getPropertiesForCollection],
  columns => {
    const defs = [SELECT_COLUMN].concat(
      _.map(columns, c => {
        return {
          ...c,
          cellRendererFramework: ValueRenderer,
          valueGetter: GETTERS[c._getterName],
          valueFormatter: FORMATTERS[c._formatterName]
        };
      })
    );
    return defs;
  }
);
