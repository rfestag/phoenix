import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { connect } from "react-redux";
import { GEOMETRY_MODAL, toggleSettingsModal } from "../modal/ModalActions";
import { updateCollectionFields } from "../collection/CollectionActions";
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

export class GeometryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geometry: { ...this.props.geometry }
    };
  }
  static propTypes = {
    open: PropTypes.bool,
    geometry: PropTypes.object,
    toggle: PropTypes.func,
    apply: PropTypes.func
  };
  toggle = () => this.props.toggle();
  apply = () => {
    console.log("Settings should now be", this.state.settings);
    this.props.apply(this.state.geometry);
    this.toggle();
  };
  setHeaderName = e => {
    let headerName = e.target.value;
    this.setState({ headerName });
  };
  setLatestOnly = e => {
    let latestOnly = e.target.value;
    this.setState({ latestOnly });
  };
  setShowHead = e => {
    let showHead = e.target.value;
    this.setState({ showHead });
  };
  setTension = e => {
    let tension = e.target.value;
    this.setState({ tension });
  };
  render() {
    const { apply, toggle, props } = this;
    const { open, geometry } = props;
    const { headerName, latestOnly, showHead, tension } = geometry;
    return (
      <Modal centered={true} size="lg" isOpen={open} toggle={toggle}>
        <ModalHeader toggle={toggle}>{geometry.headerName}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Display Name</Label>
            <Input
              value={headerName}
              type="text"
              name="headerName"
              placeholder="Display Name"
              onChange={setHeaderName}
            />
          </FormGroup>
          <FormGroup>
            <Label>Tension</Label>
            <Input
              value={tension}
              type="number"
              name="tension"
              placeholder="Tension"
              onChange={setTension}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={apply}>
            Apply
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    open: state.modal[GEOMETRY_MODAL] ? true : false,
    activeTab: state.modal[GEOMETRY_MODAL],
    settings: state.settings
  };
}
function mapDispatchToProps(dispatch) {
  return {
    toggle: () => dispatch(toggleGeometryModal()),
    apply: settings => dispatch(updateCollectionFields(settings))
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
