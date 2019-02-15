import React, { Component } from "react";
import PropTypes from "prop-types";
import ColumnManager from "../modules/columns/ColumManager";
import LayerManager from "../modules/map/LayerManager";
import { Button, TabContent, TabPane } from "reactstrap";
import { COLUMN_PANE, LAYER_PANE } from "../modules/panel/PanelActions";
import { CloseIcon } from "./Icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { closeRightPanel } from "../modules/panel/PanelActions";

const panelDisplay = {
  [COLUMN_PANE]: "Manage Columns",
  [LAYER_PANE]: "Manage Layers"
};

export class RightPanel extends Component {
  static propTypes = {
    activePane: PropTypes.string
  };

  render() {
    console.log("Pane", panelDisplay[this.props.activePane]);
    console.log(panelDisplay, COLUMN_PANE, LAYER_PANE);
    return (
      <TabContent
        activeTab={this.props.activePane}
        style={{
          flex: "1",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h2>
          {panelDisplay[this.props.activePane]}{" "}
          <Button
            close
            onClick={this.props.closeRightPanel}
            style={{ height: "100%" }}
          />
        </h2>
        <TabPane tabId={COLUMN_PANE} style={{ flex: 1 }}>
          <ColumnManager />
        </TabPane>
        <TabPane tabId={LAYER_PANE} style={{ flex: 1 }}>
          <LayerManager />
        </TabPane>
      </TabContent>
    );
  }
}

RightPanel.propTypes = {
  closeRightPanel: PropTypes.func.required
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeRightPanel
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(RightPanel);
