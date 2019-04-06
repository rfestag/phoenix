import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, ButtonGroup, Form, FormGroup, Label, Input } from "reactstrap";
import { createQuery } from "../modules/query/QueryActions";
import PerfectScrollbar from "react-perfect-scrollbar";
import FilterableDropdownTree from "./FilterableDropdownTree";
import Ageoff from "./Ageoff";
import * as sources from "../modules/sources/SourceMap";
import Select from "./Select";
import _ from "lodash";

const defaultQuery = () => ({ type: "and", rules: [], groups: [] });
export class QueryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      source: sources["Test"],
      query: {},
      ageoff: { ageoff: 5, unit: "minutes" }
    };
  }
  static propTypes = {
    createQuery: PropTypes.func.isRequired
  };
  clear = () => {
    this.setState({
      name: "",
      source: sources["Test"],
      query: {},
      ageoff: { ageoff: 5, unit: "minutes" }
    });
  };
  setName = e => {
    let name = e.target.value;
    this.setState({ name });
  };
  setAgeoff = ageoff => {
    this.setState({ ageoff });
  };
  setSource = option => {
    console.log("Setting source", option.value);
    this.setState({ source: option.value });
  };
  setQuery = query => {
    this.setState({ query });
  };
  updateFilter = event => {
    const filter = event.target.value;
    this.setState({ filter });
  };
  execute = event => {
    console.log(this.state);
    this.props.createQuery(
      this.state.source.name,
      this.state.query,
      this.state.name,
      this.state.ageoff
    );
  };
  render() {
    const { name, query, source, ageoff } = this.state;
    const {
      setName,
      setSource,
      setAgeoff,
      setQuery,
      data,
      clear,
      execute,
      handleFormUpdate
    } = this;
    const sourceOptions = _.map(sources, value => ({
      label: value.name,
      value
    }));
    let currentSource = { label: source.name, value: source };
    console.log("Source", source, currentSource);
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Form style={{ width: "100%", flex: 1, overflow: "hidden" }}>
          <PerfectScrollbar>
            <div style={{ padding: 15 }}>
              <h3>Query</h3>
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
              <FormGroup>
                <Label for="source">Source</Label>
                <Select
                  options={sourceOptions}
                  value={currentSource}
                  onChange={setSource}
                />
              </FormGroup>
              <FormGroup>
                <Label for="ageoff">Age-Off</Label>
                <Ageoff id="ageoff" onChange={setAgeoff} value={ageoff} />
              </FormGroup>
              {/*
                <div>
                  <FilterableDropdownTree data={data} />
                </div>
              */}
              <h3>Criteria</h3>
              {source.Form && <source.Form data={query} onChange={setQuery} />}
            </div>
          </PerfectScrollbar>
        </Form>
        <ButtonGroup style={{ marginTop: "auto", display: "flex" }}>
          <Button style={{ flex: 1 }} onClick={clear}>
            Clear
          </Button>
          <Button style={{ flex: 1 }} color="accent" onClick={execute}>
            Query
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createQuery
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(QueryPanel);
