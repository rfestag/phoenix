import React from "react";
import PropTypes from "prop-types";
import Tree from "./Tree";
import { InputGroup, Input } from "reactstrap";

export default class FilterableTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  static propTypes = {
    data: PropTypes.array.isRequired
  };
  updateFilter = event => {
    const filter = event.target.value;
    this.setState({ filter });
  };
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <InputGroup>
          <Input
            autoFocus={true}
            placeholder="Filter"
            onChange={this.updateFilter}
          />
        </InputGroup>
        <div style={{ flex: 1, maxHeight: 200 }}>
          <Tree data={this.props.data} filter={this.state.filter} />
        </div>
      </div>
    );
  }
}
