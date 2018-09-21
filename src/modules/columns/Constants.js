import { createSelector } from "reselect";
import ValueRenderer from "./ValueRenderer";
import moment from "moment";
import _ from "lodash";

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
      checkboxSelection: true,
      pinned: true,
      suppressMenu: true,
      headerCheckboxSelection: true,
      width: 40,
      suppressResize: true,
      suppressSizeToFit: true
    },
    { headerName: "ID", field: "id" },
    {
      headerName: "First seen",
      field: "start",
      valueFormatter: FORMATTERS.timeFormatter,
      cellRendererFramework: ValueRenderer,
      //enableCellChangeFlash: true,
      valueGetter: GETTERS.timeGetter
    },
    {
      headerName: "Last seen",
      field: "end",
      valueFormatter: FORMATTERS.timeFormatter,
      cellRendererFramework: ValueRenderer,
      //enableCellChangeFlash: true,
      valueGetter: GETTERS.timeGetter
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
export const getColumnsForCollection = (state, props) => {
  if (props.collection) {
    return props.collection.fields.properties;
  }
  return [];
};

export const getColumnDefs = createSelector(
  [getColumnsForCollection],
  columns => {
    return getDefaultColumns().concat(
      _.map(columns, c => {
        return {
          ...c,
          cellRendererFramework: ValueRenderer,
          valueGetter: GETTERS[c._getterName]
        };
      })
    );
  }
);
