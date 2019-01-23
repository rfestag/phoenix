import { createSelector } from "reselect";
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

export const createPropertyColumn = (field, sample, opts = {}) => {
  let columnDef = {
    field,
    headerName: field,
    hide: true,
    _getterName: "latestValueGetter"
  };
  if (sample) {
    if (_.isArray(sample)) return createPropertyColumn(field, sample[0], opts);
    if (_.isBoolean(sample)) {
      columnDef._type = "boolean";
    } else if (_.isNumber(sample)) {
      columnDef._type = "numeric";
      columnDef._unitType = undefined;
      columnDef._units = undefined;
    } else {
      columnDef._type = "string";
    }
  } else {
    columnDef._type = undefined;
  }
  return { ...columnDef, ...opts };
};
export const getDefaultColumns = () => {
  return {
    whenStart: createPropertyColumn("start", null, {
      headerName: "First seen",
      hide: false,
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    }),
    whenEnd: createPropertyColumn("end", null, {
      headerName: "Last seen",
      hide: false,
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    })
  };
};
export const createGeometryColumn = (field, value) => {};
export const getPropertiesForCollection = (state, props) => {
  if (
    props.collection &&
    props.collection.fields &&
    props.collection.fields.properties
  ) {
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
          //cellRendererFramework: ValueRenderer,
          valueGetter: GETTERS[c._getterName],
          valueFormatter: FORMATTERS[c._formatterName]
        };
      })
    );
    return defs;
  }
);
