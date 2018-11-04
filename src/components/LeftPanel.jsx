import React, { Component } from "react";
import PropTypes from "prop-types";
import QueryPanel from "./QueryPanel";
import { TabContent, TabPane } from "reactstrap";
import {
  QUERY_PANE,
  ENTITY_PANE,
  FILTER_PANE
} from "../modules/panel/PanelActions";

export default class LeftPanel extends Component {
  static propTypes = {
    activePane: PropTypes.string
  };

  render() {
    return (
      <TabContent
        activeTab={this.props.activePane}
        style={{ flex: "1", height: "100%" }}
      >
        <TabPane tabId={QUERY_PANE} style={{ height: "100%" }}>
          <QueryPanel />
        </TabPane>
        <TabPane tabId={ENTITY_PANE} style={{ height: "100%" }}>
          TODO: Entity Panel
        </TabPane>
        <TabPane tabId={FILTER_PANE} style={{ height: "100%" }}>
          TODO: Filter Panel
        </TabPane>
      </TabContent>
    );
  }
}
