import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { connect } from "react-redux";
import { SETTINGS_MODAL, toggleSettingsModal } from "../modal/ModalActions";
import { updateSettings } from "../settings/SettingsActions";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col
} from "reactstrap";

function mapStateToProps(state, props) {
  return {
    open: state.modal[SETTINGS_MODAL] ? true : false,
    activeTab: state.modal[SETTINGS_MODAL],
    settings: state.settings
  };
}
function mapDispatchToProps(dispatch) {
  return {
    toggle: () => dispatch(toggleSettingsModal()),
    apply: () => dispatch(updateSettings())
  };
}

export class SettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: JSON.parse(JSON.stringify(props.settings)),
      themes: ["Dark", "Light"]
    };
  }
  static propTypes = {
    activeTab: PropTypes.string,
    open: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    apply: PropTypes.func.isRequired
  };
  activeTab = () => this.state.activeTab || this.props.activeTab;
  setTab = activeTab => this.setState({ activeTab });
  toggle = () => this.props.toggle();
  apply = () => {
    this.props.apply(this.state.settings);
    this.toggle();
  };
  render() {
    return (
      <Modal
        centered={true}
        size="lg"
        isOpen={this.props.open}
        toggle={this.toggle}
      >
        <ModalHeader toggle={this.toggle}>Settings</ModalHeader>
        <ModalBody>
          <Row>
            <Col sm="3">
              <Nav vertical tabs>
                <NavItem onClick={() => this.setTab("general")}>
                  <NavLink
                    className={classnames({
                      active: this.activeTab() === "general"
                    })}
                  >
                    General
                  </NavLink>
                </NavItem>
                <NavItem onClick={() => this.setTab("map")}>
                  <NavLink
                    className={classnames({
                      active: this.activeTab() === "map"
                    })}
                  >
                    Map
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
            <Col sm="9">
              <TabContent activeTab={this.activeTab()}>
                <TabPane tabId="general">
                  <Row>
                    <Col sm="12">
                      <h4>General Settings</h4>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId="map">
                  <Row>
                    <Col sm="12">
                      <h4>Map Settings</h4>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggle}>
            Apply
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
