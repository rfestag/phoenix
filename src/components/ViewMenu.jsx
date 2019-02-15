import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { openColumnPane, openLayerPane } from "../modules/panel/PanelActions";

const ViewMenu = ({ openColumnPane, openLayerPane }) => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret>View</DropdownToggle>
    <DropdownMenu>
      <DropdownItem onClick={openColumnPane}>Manage Columns</DropdownItem>
      <DropdownItem onClick={openLayerPane}>Manage Layers</DropdownItem>
      <DropdownItem disabled>Manage Styles</DropdownItem>
      <DropdownItem disabled>Manage Units</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
ViewMenu.propTypes = {
  openColumnPane: PropTypes.func,
  openLayerPane: PropTypes.func
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openColumnPane,
      openLayerPane
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(ViewMenu);
