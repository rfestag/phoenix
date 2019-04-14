import { createSelector } from "reselect";
import moment from "moment";
import _ from "lodash";
import ColumnHeader from "./ColumnHeader";

const SELECT_COLUMN = {
  checkboxSelection: true,
  pinned: true,
  suppressMenu: true,
  headerCheckboxSelection: true,
  width: 40,
  suppressSizeToFit: true,
  resize: false
};

export const GETTERS = {
  latestValueGetter: params => {
    let { properties } = params.data;
    let { field, _type } = params.colDef;
    if (properties[field] === undefined) return undefined;
    let last = properties[field].value;
    return _type === "numeric" ? Number(last) : last;
  },
  timeGetter: params => {
    let { when } = params.data;
    let { field } = params.colDef;
    return when[field];
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
    position: 0,
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
    start: createPropertyColumn("start", null, {
      headerName: "First seen",
      hide: false,
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    }),
    end: createPropertyColumn("end", null, {
      headerName: "Last seen",
      hide: false,
      _type: "time",
      _getterName: "timeGetter",
      _formatterName: "timeFormatter"
    })
  };
};
export const createGeometryColumn = (field, opts = {}) => {
  let geomDef = {
    field,
    headerName: field,
    hide: false,
    latestOnly: true,
    style: {
      strokeColor: "red",
      strokeOpacity: 1,
      fillColor: "red",
      fillOpacity: 0.65,
      icon: undefined,
      dash: undefined
    },
    showHead: true, //Only applicable to tracks/lines
    tension: 0.5 //Onely applicable to tracks/lines
  };
  if (opts && opts.etype === "Track") geomDef.latestOnly = false;
  return { ...geomDef, ...opts };
};
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
          valueGetter: GETTERS[c._getterName],
          valueFormatter: FORMATTERS[c._formatterName],
          headerComponentFramework: ColumnHeader
        };
      }).sort((a, b) => a.position - b.position)
    );
    return defs;
  }
);
