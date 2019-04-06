import React from "react";
import PropTypes from "prop-types";
import FilterableDropdownTree from "../../components/FilterableDropdownTree";
import { Input, FormGroup, Label } from "reactstrap";
import Select from "../../components/Select";
var RANDOM_WORDS = [
  "abstrusity",
  "advertisable",
  "bellwood",
  "benzole",
  "boreum",
  "brenda",
  "cassiopeian",
  "chansonnier",
  "cleric",
  "conclusional",
  "conventicle",
  "copalm",
  "cornopion",
  "crossbar",
  "disputative",
  "djilas",
  "ebracteate",
  "ephemerally",
  "epidemical",
  "evasive",
  "eyeglasses",
  "farragut",
  "fenny",
  "ferryman",
  "fluently",
  "foreigner",
  "genseng",
  "glaiket",
  "haunch",
  "histogeny",
  "illocution",
  "imprescriptible",
  "inapproachable",
  "incisory",
  "intrusiveness",
  "isoceraunic",
  "japygid",
  "juiciest",
  "jump",
  "kananga",
  "leavening",
  "legerdemain",
  "licence",
  "licia",
  "luanda",
  "malaga",
  "mathewson",
  "nonhumus",
  "nonsailor",
  "nummary",
  "nyregyhza",
  "onanist",
  "opis",
  "orphrey",
  "paganising",
  "pebbling",
  "penchi",
  "photopia",
  "pinocle",
  "principally",
  "prosector.",
  "radiosensitive",
  "redbrick",
  "reexposure",
  "revived",
  "subexternal",
  "sukarnapura",
  "supersphenoid",
  "tabularizing",
  "territorialism",
  "tester",
  "thalassography",
  "tuberculise",
  "uncranked",
  "undersawyer",
  "unimpartible",
  "unsubdivided",
  "untwining",
  "unwaived",
  "webfoot",
  "wedeling",
  "wellingborough",
  "whiffet",
  "whipstall",
  "wot",
  "yonkersite",
  "zonary"
];
function createRandomizedData() {
  var data = [];

  for (var i = 0; i < 1000; i++) {
    data.push(createRandomizedItem(0));
  }

  return data;
}

function createRandomizedItem(depth) {
  var item = {};
  item.children = [];
  item.name = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];

  var numChildren = depth < 3 ? Math.floor(Math.random() * 5) : 0;
  for (var i = 0; i < numChildren; i++) {
    item.children.push(createRandomizedItem(depth + 1));
  }

  item.expanded = numChildren > 0 && Math.random() < 0.25;

  return item;
}

const RANDOM_DATA = createRandomizedData(1000);
const ALLOWED_SHAPES = [
  "None",
  "Track",
  "LineString",
  "Circle",
  "Sector",
  "Polygon"
];
const ALLOWED_SHAPE_OPTIONS = ALLOWED_SHAPES.map(t => ({ label: t, value: t }));
const DEFAULT_PROPS = {
  tree: RANDOM_DATA,
  count: 100,
  iterations: 30,
  interval: 500,
  shapeTypes: ALLOWED_SHAPES
};

class TestForm extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  componentDidMount = () => {
    this.props.onChange({ ...DEFAULT_PROPS });
  };
  setCount = e => {
    const count = e.target.value;
    this.props.onChange({ ...this.props.data, count });
  };
  setIterations = e => {
    const iterations = e.target.value;
    this.props.onChange({ ...this.props.data, iterations });
  };
  setInterval = e => {
    const interval = e.target.value;
    this.props.onChange({ ...this.props.data, interval });
  };
  setShapeTypes = types => {
    const shapeTypes = types.map(t => t.value);
    this.props.onChange({ ...this.props.data, shapeTypes });
  };
  render() {
    let { onChange, data, ...props } = this.props;
    //We do some gymnastics here because the default object is empty.
    //We want to override defaults if any expected settings are passed in.
    //We don't ever want any expected values to be undefined, because the Input
    //elements will be created as Uncontrolled instead of Controlled.
    data = { ...DEFAULT_PROPS, ...data };
    let { tree, count, iterations, interval, shapeTypes } = data;
    let { setCount, setIterations, setShapeTypes, setInterval } = this;
    let shapeTypeValues = shapeTypes
      ? shapeTypes.map(t => ({ label: t, value: t }))
      : [];

    return (
      <div>
        <FormGroup>
          <Label>Total Entities</Label>
          <Input
            value={count}
            type="number"
            name="count"
            placeholder="Number of entities to generate"
            onChange={setCount}
          />
        </FormGroup>
        <FormGroup>
          <Label>Updates</Label>
          <Input
            value={iterations}
            type="number"
            name="iterations"
            placeholder="Number of updates to generate per entity"
            onChange={setIterations}
          />
        </FormGroup>
        <FormGroup>
          <Label>Interval (ms)</Label>
          <Input
            value={interval}
            type="number"
            name="updateInterval"
            placeholder="Update Rate (ms)"
            onChange={setInterval}
          />
        </FormGroup>
        <FormGroup>
          <Label>Shape Types</Label>
          <Select
            placeholder="Shape Types..."
            options={ALLOWED_SHAPE_OPTIONS}
            value={shapeTypeValues}
            onChange={setShapeTypes}
            isClearable
            isMulti
          />
        </FormGroup>
        <FormGroup>
          <Label>Example Tree Dropdown</Label>
          <FilterableDropdownTree data={tree} />
        </FormGroup>
      </div>
    );
  }
}

export default TestForm;
