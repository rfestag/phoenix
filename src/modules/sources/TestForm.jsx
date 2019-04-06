import React from "react";
import PropTypes from "prop-types";
import FilterableDropdownTree from "../../components/FilterableDropdownTree";

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

class TestForm extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  componentDidMount = () => {
    var data = createRandomizedData();
    this.props.onChange(data);
  };
  render() {
    let { onChange, data, ...props } = this.props;
    let { handleFormChange } = this;
    return (
      <div>
        <FilterableDropdownTree data={data} />
      </div>
    );
  }
}

export default TestForm;
