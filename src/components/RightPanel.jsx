import React, { Component } from "react";
import PropTypes from "prop-types";
import ColumnManager from "../modules/columns/ColumManager";
import LayerManager from "../modules/map/LayerManager";
import { TabContent, TabPane } from "reactstrap";
import { COLUMN_PANE, LAYER_PANE } from "../modules/panel/PanelActions";

export default class RightPanel extends Component {
  static propTypes = {
    activePane: PropTypes.string
  };

  render() {
    return (
      <TabContent
        activeTab={this.props.activePane}
        style={{ flex: "1", height: "100%" }}
      >
        <TabPane tabId={COLUMN_PANE} style={{ height: "100%" }}>
          <ColumnManager />
        </TabPane>
        <TabPane tabId={LAYER_PANE} style={{ height: "100%" }}>
          <LayerManager />
        </TabPane>
      </TabContent>
    );
  }
}
