import React, { Component } from "react";
import PropTypes from "prop-types";
import ColumnManager from "../modules/columns/ColumManager";
import { TabContent, TabPane } from "reactstrap";
import { COLUMN_PANE, LAYER_PANE } from "../modules/panel/PanelActions";

export default class RightPanel extends Component {
  static propTypes = {
    activePane: PropTypes.object
  };

  render() {
    return (
      <TabContent activeTab={this.props.activePane} style={{ flex: "1" }}>
        <TabPane tabId={COLUMN_PANE}>
          <ColumnManager />
        </TabPane>
        <TabPane tabId={LAYER_PANE}>TODO: Layer pane</TabPane>
      </TabContent>
    );
  }
}
