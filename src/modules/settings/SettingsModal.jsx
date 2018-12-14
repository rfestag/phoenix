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
  Col,
  FormGroup,
  Label,
  Input
} from "reactstrap";

export class SettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: JSON.parse(JSON.stringify(props.settings)),
      themes: ["Dark", "Light"]
    };
  }
  static propTypes = {
    activeTab: PropTypes.bool,
    open: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    apply: PropTypes.func.isRequired
  };
  activeTab = () => this.state.activeTab || this.props.activeTab;
  setTab = activeTab => this.setState({ activeTab });
  toggle = () => this.props.toggle();
  apply = () => {
    console.log("Settings should now be", this.state.settings);
    this.props.apply(this.state.settings);
    this.toggle();
  };
  themeChanged = e => {
    console.log("Theme changed", e.target.value);
    const general = { ...this.state.settings.general, theme: e.target.value };
    const settings = { ...this.state.settings, general };
    this.setState({ settings });
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
                      <FormGroup tag="fieldset" row>
                        <legend className="col-form-label col-sm-2">
                          Theme
                        </legend>
                        <Col sm={10} onChange={this.themeChanged}>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="radio"
                                name="theme"
                                value="light"
                                defaultChecked={
                                  this.state.settings.general.theme === "light"
                                }
                              />{" "}
                              Light
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="radio"
                                name="theme"
                                value="dark"
                                defaultChecked={
                                  this.state.settings.general.theme === "dark"
                                }
                              />{" "}
                              Dark
                            </Label>
                          </FormGroup>
                        </Col>
                      </FormGroup>
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
          <Button color="primary" onClick={this.apply}>
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
    apply: settings => dispatch(updateSettings(settings))
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
