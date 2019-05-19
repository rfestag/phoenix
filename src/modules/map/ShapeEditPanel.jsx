import React from "react";
import PropTypes from "prop-types";
import {
  UncontrolledButtonDropdown as Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Form,
  FormGroup,
  Label,
  ButtonGroup,
  Button
} from "reactstrap";
import Dialog from "../../components/Dialog";

class ShapeEditPanel extends React.Component {
  static propTypes = {
    open: PropTypes.func,
    close: PropTypes.func
  };
  render() {
    return (
      <Dialog
        initWidth={300}
        initHeight={450}
        isOpen={this.props.open}
        title="Edit Shape"
        onClose={this.props.close}
      >
        <Form>
          <FormGroup>
            <Label>Name</Label>
            <Input type="text" />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input type="textarea" />
          </FormGroup>
          <FormGroup>
            <Label>Positions</Label>
            <Input type="textarea" />
          </FormGroup>
          <ButtonGroup>
            <Button>Cancel</Button>
            <Button color="accent">Save</Button>
          </ButtonGroup>
        </Form>
      </Dialog>
    );
  }
}

export default ShapeEditPanel;
