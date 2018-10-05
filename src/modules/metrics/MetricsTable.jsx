import "react-virtualized/styles.css";
import React from "react";
import PropTypes from "prop-types";
import { AutoSizer, Table, Column } from "react-virtualized";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import _ from "lodash";
const getTiming = (state, props) => state.metrics.timing;
const timingSelector = createSelector([getTiming], d =>
  _.map(d, (v, metric) => ({ metric, ...v }))
);

export const MetricsTable = ({ data }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowCount={data.length}
            rowGetter={({ index }) => data[index]}
            data={data}
            rowHeight={24}
          >
            <Column label="Metric" dataKey="metric" width={300} />
            <Column label="Min" dataKey="min" width={100} />
            <Column label="Max" dataKey="max" width={100} />
            <Column label="Avg" dataKey="avg" width={100} />
            <Column label="Count" dataKey="count" width={100} />
            <Column label="Total" dataKey="total" width={100} />
          </Table>
        )}
      </AutoSizer>
    </div>
  );
};

MetricsTable.propTypes = {
  data: PropTypes.array.isRequired
};

function mapStateToProps(state, props) {
  //Only map subset of state that map actually requires for rendering
  return {
    data: timingSelector(state, props)
  };
}

export default connect(mapStateToProps)(MetricsTable);
