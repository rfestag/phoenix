import React from "react";
import PropTypes from "prop-types";
import {
  Input,
  Form,
  FormGroup,
  Label,
  ButtonGroup,
  Button,
  Col,
  Row
} from "reactstrap";
import Dialog from "../../components/Dialog";

const RectanglePosition = ({ shape, onChange }) => (
  <div>
    <Label>Bounds</Label>
    <Row>
      <Col xs={{ size: 6, offset: 3 }}>
        <FormGroup>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
    <Row>
      <Col>
        <FormGroup>
          <Input type="text" />
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
    <Row>
      <Col xs={{ size: 6, offset: 3 }}>
        <FormGroup>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
  </div>
);
RectanglePosition.propTypes = {
  shape: PropTypes.object,
  onChange: PropTypes.func
};
const CirclePosition = ({ shape, onChange }) => (
  <div>
    <Row>
      <Col>
        <FormGroup>
          <Label>Latitude</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <Label>Longitude</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
    <Row>
      <Col>
        <FormGroup>
          <Label>Radius</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <Label>Units</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
  </div>
);
CirclePosition.propTypes = {
  shape: PropTypes.object,
  onChange: PropTypes.func
};
const LinePosition = ({ shape, onChange }) => (
  <FormGroup>
    <Label>Positions</Label>
    <Input type="textarea" />
  </FormGroup>
);
LinePosition.propTypes = {
  shape: PropTypes.object,
  onChange: PropTypes.func
};
const PolygonPosition = ({ shape, onChange }) => (
  <FormGroup>
    <Label>Positions</Label>
    <Input type="textarea" />
  </FormGroup>
);
PolygonPosition.propTypes = {
  shape: PropTypes.object,
  onChange: PropTypes.func
};
const LabelPosition = ({ shape, onChange }) => (
  <FormGroup>
    <Row>
      <Col>
        <FormGroup>
          <Label>Latitude</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
      <Col>
        <FormGroup>
          <Label>Longitude</Label>
          <Input type="text" />
        </FormGroup>
      </Col>
    </Row>
  </FormGroup>
);
LabelPosition.propTypes = {
  shape: PropTypes.object,
  onChange: PropTypes.func
};
const ShapePosition = ({ shape }) => {
  const activeTool = shape && shape.properties && shape.properties.type;
  if (activeTool === "circle") return <CirclePosition shape={shape} />;
  else if (activeTool === "rectangle")
    return <RectanglePosition shape={shape} />;
  else if (activeTool === "polygon") return <PolygonPosition shape={shape} />;
  else if (activeTool === "polyline") return <LinePosition shape={shape} />;
  else if (activeTool === "label") return <LabelPosition shape={shape} />;
  else return null;
};
class ShapeEditPanel extends React.Component {
  static propTypes = {
    shape: PropTypes.object,
    onApply: PropTypes.func,
    onCancel: PropTypes.func
  };
  state = {};
  componentDidUpdate(prevProps) {
    //Reset state when shape changes
    if (prevProps.shape !== this.props.shape) {
      this.setState({ name: undefined, coordinates: undefined });
    }
  }
  getName = () => {
    const shape = this.props.shape;
    const name = this.state.name;
    console.log(shape, name);
    return name || (shape && shape.properties && shape.properties.name);
  };
  setName = e => {
    const name = e.target.value;
    this.setState({ name });
  };
  onApply = e => {
    const name = this.getName();
    this.props.shape.properties.name = name;
    this.props.shape.properties.updated = Date.now();
    this.props.shape.setTooltipContent(name);
    this.props.onApply(e);
  };
  render() {
    const { getName, setName, onApply, props, state } = this;
    const { open, shape, onCancel } = props;
    const activeTool = shape && shape.properties && shape.properties.type;

    const coordinates = state.coordinates;
    return (
      <Dialog
        initWidth={300}
        initHeight={450}
        isOpen={open}
        title={`Edit ${activeTool}`}
        onClose={onCancel}
      >
        <Form style={{ margin: 8 }}>
          <FormGroup>
            <Label>Name</Label>
            <Input type="text" onChange={setName} value={getName()} />
          </FormGroup>
          <ShapePosition shape={shape} coordinates={coordinates} />
          <FormGroup>
            <Label>Description</Label>
            <Input type="textarea" />
          </FormGroup>
          <ButtonGroup style={{ float: "right" }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onApply} color="accent">
              Apply
            </Button>
          </ButtonGroup>
        </Form>
      </Dialog>
    );
  }
}

export default ShapeEditPanel;
