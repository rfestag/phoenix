import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { toggleSettingsModal } from "../modules/modal/ModalActions";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

function mapDispatchToProps(dispatch) {
  return {
    toggleMapSettingsModal: () => dispatch(toggleSettingsModal("map")),
    toggleGeneralSettingsModal: () => dispatch(toggleSettingsModal("general"))
  };
}

const SettingsMenu = ({
  toggleMapSettingsModal,
  toggleGeneralSettingsModal
}) => (
  <Dropdown setActiveFromChild>
    <DropdownToggle caret style={{ boxShadow: "none !important" }}>
      Settings
    </DropdownToggle>
    <DropdownMenu right style={{ top: -5 }}>
      <DropdownItem onClick={toggleMapSettingsModal}>Map Settings</DropdownItem>
      <DropdownItem onClick={toggleGeneralSettingsModal}>
        General Settings
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

SettingsMenu.propTypes = {
  toggleMapSettingsModal: PropTypes.func.isRequired,
  toggleGeneralSettingsModal: PropTypes.func.isRequired
};

export default connect(null, mapDispatchToProps)(SettingsMenu);
