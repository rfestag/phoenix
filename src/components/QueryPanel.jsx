import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, InputGroup, Input } from "reactstrap";
import { createQuery } from "../modules/query/QueryActions";
import FilterableDropdownTree from "./FilterableDropdownTree";

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

export class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static propTypes = {
    query: PropTypes.func.isRequired
  };
  updateFilter = event => {
    const filter = event.target.value;
    this.setState({ filter });
  };
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Button onClick={this.props.query}>Test</Button>
        <FilterableDropdownTree data={data} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    query: () => dispatch(createQuery("Test", {}, "My Test"))
  };
}

export default connect(null, mapDispatchToProps)(QueryPanel);
