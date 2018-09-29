import React, { Component } from "react";
import PropTypes from "prop-types";
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
      <TabContent activeTab={this.props.activePane} style={{ flex: "1" }}>
        <TabPane tabId={QUERY_PANE}>TODO: Query Panel</TabPane>
        <TabPane tabId={ENTITY_PANE}>TODO: Entity Panel</TabPane>
        <TabPane tabId={FILTER_PANE}>TODO: Filter Panel</TabPane>
      </TabContent>
    );
  }
}
