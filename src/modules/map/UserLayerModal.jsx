import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import uuid from "uuid/v4";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { USER_LAYER_MODAL, toggleUserLayerModal } from "../modal/ModalActions";
import { addUserLayer, updateUserLayer } from "../map/MapActions";
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

export class UserLayerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.layer ? "Edit Layer" : "Create Layer",
      layer: props.layer
        ? JSON.parse(JSON.stringify(props.layer))
        : { name: "New Layer", active: true, id: uuid(), features: [] }
    };
  }
  static propTypes = {
    open: PropTypes.bool.isRequired,
    layer: PropTypes.object,
    toggle: PropTypes.func.isRequired,
    update: PropTypes.func,
    create: PropTypes.func
  };
  apply = () => {
    if (this.props.layer) {
      this.props.update(this.state.layer);
    } else {
      this.props.create(this.state.layer);
    }
    this.props.toggle();
  };
  setName = e => {
    const layer = { ...this.state.layer };
    layer.name = e.target.value;
    this.setState({ layer });
  };
  render() {
    const { props, state, apply, setName } = this;
    const { open, toggle } = props;
    const title = state.title;
    const name = state.layer.name;

    return (
      <Modal centered={true} size="sm" isOpen={open} toggle={toggle}>
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Layer Name</Label>
            <Input value={name} onChange={setName} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="accent" onClick={apply}>
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
    layer: state.map.editLayer,
    open: state.modal[USER_LAYER_MODAL] ? true : false,
    activeTab: state.modal[USER_LAYER_MODAL]
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggle: toggleUserLayerModal,
      create: addUserLayer,
      update: updateUserLayer
    },
    dispatch
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(UserLayerModal);
