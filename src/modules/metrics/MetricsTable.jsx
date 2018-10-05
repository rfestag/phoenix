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
    totalTime: v.total / runtime,
    ...v
  }));
  return result;
});
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
            <Column label="Metric" dataKey="metric" width={400} />
            <Column label="Min" dataKey="min" width={100} />
            <Column label="Max" dataKey="max" width={100} />
            <Column label="Avg" dataKey="avg" width={100} />
            <Column label="Count" dataKey="count" width={100} />
            <Column label="Total" dataKey="total" width={100} />
            <Column label="Total Time" dataKey="totalTime" width={100} />
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
