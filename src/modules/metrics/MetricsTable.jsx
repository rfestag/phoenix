import "react-virtualized/styles.css";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { AutoSizer, Table, Column, SortDirection } from "react-virtualized";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import _ from "lodash";
import VirtualTable from "../../components/VirtualTable";

const getMetrics = (state, props) => state.metrics.timing;
const getStart = (state, props) => state.metrics.start;
const metrics = createSelector([getMetrics, getStart], (metrics, start) => {
  const runtime = Date.now() - start;
  let result = _.map(metrics, (v, metric) => ({
    metric,
    percent: v.total / runtime,
    ...v
  }));
  return result;
});

const numberFormatter = ({ columnData = { defaultValue: "" }, cellData }) => {
  const { defaultValue, fixed } = columnData;
  if (cellData === null) return defaultValue;
  if (!cellData.toPrecision || fixed === undefined) return cellData;
  return cellData.toFixed(fixed);
};
const percentFormatter = ({
  columnData = { defaultValue: "", fixed: 2 },
  cellData
}) => {
  const { defaultValue, fixed } = columnData;
  if (cellData === null) return defaultValue;
  if (!cellData.toFixed || fixed === undefined) return cellData + "%";
  return cellData.toFixed(fixed) + "%";
};
export const MetricsTable = ({ data }) => {
  return (
    <div style={{ width: "100%", height: "100%", paddingTop: 10 }}>
      <AutoSizer>
        {({ height, width }) => (
          <VirtualTable
            width={width}
            height={height}
            list={data}
            rowHeight={24}
            headerHeight={24}
          >
            <Column label="Metric" dataKey="metric" width={300} />
            <Column
              label="Min"
              dataKey="min"
              width={50}
              columnData={{ fixed: 1 }}
              cellRenderer={numberFormatter}
            />
            <Column
              label="Max"
              dataKey="max"
              width={60}
              columnData={{ fixed: 1 }}
              cellRenderer={numberFormatter}
            />
            <Column
              label="Avg"
              dataKey="avg"
              width={50}
              columnData={{ fixed: 1 }}
              cellRenderer={numberFormatter}
            />
            <Column
              label="Count"
              dataKey="count"
              width={75}
              cellRenderer={numberFormatter}
            />
            <Column
              label="Total"
              dataKey="total"
              width={75}
              cellRenderer={numberFormatter}
            />
            <Column
              label="% Time"
              dataKey="percent"
              width={150}
              cellRenderer={percentFormatter}
            />
          </VirtualTable>
        )}
      </AutoSizer>
    </div>
  );
};

MetricsTable.propTypes = {
  data: PropTypes.array.isRequired
};

function mapStateToProps(state, props) {
  return {
    data: metrics(state, props)
  };
}

export default connect(mapStateToProps)(MetricsTable);
