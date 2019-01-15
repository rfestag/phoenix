import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Col,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from "reactstrap";
import { createQuery } from "../modules/query/QueryActions";
import PerfectScrollbar from "react-perfect-scrollbar";
import FilterableDropdownTree from "./FilterableDropdownTree";
import * as sources from "../modules/sources/SourceMap";

let source = sources["ADSBApollo"];

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
var data = createRandomizedData();

function createRandomizedData() {
  var data = [];

  for (var i = 0; i < 10000; i++) {
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

const defaultQuery = { type: "and", rules: [], groups: [] };
export class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "", query: defaultQuery };
  }
  static propTypes = {
    createQuery: PropTypes.func.isRequired
  };
  clear = () => {
    this.setState({
      name: "",
      query: defaultQuery
    });
  };
  setName = e => {
    let name = e.target.value;
    this.setState({ name });
  };
  updateFilter = event => {
    const filter = event.target.value;
    this.setState({ filter });
  };
  execute = event => {
    console.log(this.state);
    this.props.createQuery("ADSBApollo", this.state.query, this.state.name);
  };
  handleFormUpdate = (event, value, selectedKey) => {
    console.log(event, query, selectedKey);
    let query = { ...this.state.query, ...value };
    console.log(value, query);

    this.setState({ query });
  };
  render() {
    const { name, query } = this.state;
    const { setName, clear, execute, handleFormUpdate } = this;
    console.log("Query", query);
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Form
          style={{ width: "100%", flex: 1, padding: 10, overflow: "hidden" }}
        >
          <PerfectScrollbar>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                value={name}
                type="text"
                name="name"
                id="name"
                placeholder="Query Name"
                onChange={setName}
              />
            </FormGroup>
            {/*<div style={{ float: "right" }}>
              <FilterableDropdownTree data={data} />
            </div>*/}
            <source.Form group={query} onChange={handleFormUpdate} />
          </PerfectScrollbar>
        </Form>
        <ButtonGroup style={{ marginTop: "auto", display: "flex" }}>
          <Button style={{ flex: 1 }} onClick={clear}>
            Clear
          </Button>
          <Button style={{ flex: 1 }} onClick={execute}>
            Query
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createQuery: (src, opts, name) => dispatch(createQuery(src, opts, name))
  };
}

export default connect(null, mapDispatchToProps)(QueryPanel);
