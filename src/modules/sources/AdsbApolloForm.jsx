import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import uuid from "uuid/v4";
import {
  Col,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  UncontrolledTooltip
} from "reactstrap";
import { DeleteIcon, AddGroupIcon, AddRuleIcon } from "../../components/Icons";
import CreatableSelect from "react-select/lib/Creatable";
import Select from "react-select";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import * as themeProps from "../../themes";
const getTheme = (state, props) => state.settings.general.theme;
const getThemeProps = createSelector([getTheme], theme => {
  return themeProps[theme];
});

class RuleList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    rules: PropTypes.array.isRequired
  };
  handleFieldChange = index => (event, value, selectedKey) => {
    let data = [...this.props.rules];
    data[index] = value;
    this.props.onChange(null, data);
  };
  handleFieldRemove = index => (event, value, selectedKey) => {
    let data = [...this.props.rules];
    data.splice(index, 1);
    this.props.onChange(null, data);
  };
  render() {
    let { rules } = this.props;
    return (
      <div style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4 }}>
        {rules.map((rule, index) => (
          <Rule
            key={rule.id}
            rule={rule}
            onChange={this.handleFieldChange(index)}
            onRemove={this.handleFieldRemove(index)}
            canRemove={rules.length > 1}
          />
        ))}
      </div>
    );
  }
}
class GroupList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired
  };
  handleFieldChange = index => (event, value, selectedKey) => {
    let data = [...this.props.groups];
    data[index] = value;
    this.props.onChange(null, data);
  };
  handleFieldRemove = index => (event, value, selectedKey) => {
    let data = [...this.props.groups];
    data.splice(index, 1);
    this.props.onChange(null, data);
  };
  render() {
    let { groups } = this.props;
    return (
      <div style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4 }}>
        {groups.map((group, index) => (
          <QueryGroup
            key={group.id}
            group={group}
            onChange={this.handleFieldChange(index)}
            onRemove={this.handleFieldRemove(index)}
            canRemove={true}
          />
        ))}
      </div>
    );
  }
}
const operations = [
  { label: "IN", value: "in" },
  { label: "CONTAINS", value: "contains" },
  { label: "STARTSWITH", value: "startswith" },
  { label: "ENDSWITH", value: "endswith" },
  { label: "<", value: "gt" },
  { label: "<=", value: "gte" },
  { label: ">", value: "lt" },
  { label: ">=", value: "lte" }
];
const fieldsStyles = {
  control: provided => ({
    ...provided,
    borderRadius: 0,
    backgroundColor: themeProps.dark.inputBg,
    width: "100%"
  }),
  singleValue: provided => ({
    ...provided,
    color: themeProps.dark.bodyColor
  }),
  input: provided => ({
    ...provided,
    color: themeProps.dark.bodyColor
  }),
  menu: (provided, state) => {
    return state.options.length === 0
      ? { width: 0, height: 0 }
      : { ...provided, background: themeProps.dark.bodyBg };
  }
};
const operationsStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: themeProps.dark.inputBg,
    borderRadius: 0,
    width: 170
  }),
  singleValue: provided => ({
    ...provided,
    color: themeProps.dark.bodyColor
  }),
  input: provided => ({
    ...provided,
    color: themeProps.dark.bodyColor
  }),
  option: (provided, state) => {
    return {
      ...provided,
      backgroundColor: state.isFocused
        ? themeProps.dark.active
        : provided.backgroundColor,
      color: state.isFocused ? themeProps.dark.activeColor : provided.color
    };
  },
  menu: (provided, state) => {
    return state.options.length === 0
      ? { width: 0, height: 0 }
      : { ...provided, background: themeProps.dark.bodyBg };
  }
};
class Rule extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    canRemove: PropTypes.bool.isRequired
  };
  render() {
    const { canRemove, onRemove } = this.props;
    return (
      <div
        style={{ display: "flex", flexDirection: "column", paddingBottom: 6 }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <CreatableSelect onChange={this.setField} styles={fieldsStyles} />
          </div>
          <Select options={operations} styles={operationsStyles} />
          {canRemove && (
            <Button onClick={onRemove} size="sm" title="Remove">
              <DeleteIcon />
            </Button>
          )}
        </div>
        <CreatableSelect isMulti styles={fieldsStyles} />
      </div>
    );
  }
}

class QueryGroup extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    canRemove: PropTypes.bool.isRequired,
    group: PropTypes.object.isRequired
  };
  handleFieldChange = field => (event, value, selectedKey) => {
    let data = { ...this.props.group };
    data[field] = value;
    // you could pass the event here but also null if it is not necessary nor useful
    this.props.onChange(null, data);
  };
  setType = this.handleFieldChange("type");
  setAnd = () => {
    this.setType(null, "and");
  };
  setOr = () => {
    this.setType(null, "or");
  };
  changeRules = this.handleFieldChange("rules");
  changeGroups = this.handleFieldChange("groups");
  addRule = () => {
    let rules = [...this.props.group.rules];
    let rule = { id: uuid() };
    rules.push(rule);
    this.changeRules(null, rules);
  };
  addGroup = () => {
    let groups = [...this.props.group.groups];
    let group = {
      id: uuid(),
      type: "and",
      rules: [{ id: uuid() }],
      groups: []
    };
    groups.push(group);
    this.changeGroups(null, groups);
  };
  render() {
    let { group, onRemove, canRemove } = this.props;
    let { id, type, rules, groups } = group;
    console.log("Can remove", id, canRemove);
    let { setAnd, setOr, addRule, addGroup, handleFieldChange } = this;
    return (
      <FormGroup style={{ margin: 0 }}>
        <div style={{ display: "flex" }}>
          <ButtonGroup>
            <Button
              onClick={setAnd}
              className={type === "and" ? "active" : ""}
              size="sm"
            >
              And
            </Button>
            <Button
              onClick={setOr}
              className={type === "or" ? "active" : ""}
              size="sm"
            >
              Or
            </Button>
          </ButtonGroup>
          <div style={{ flex: 1 }} />
          <ButtonGroup style={{ paddingRight: 16 }}>
            {canRemove && (
              <Button onClick={onRemove} size="sm" title="Remove">
                <DeleteIcon />
              </Button>
            )}
          </ButtonGroup>
          <ButtonGroup style={{ marginLeft: "auto" }}>
            <Button
              id={`addR-${id}`}
              onClick={addRule}
              size="sm"
              title="Add Rule"
            >
              <AddRuleIcon />
            </Button>
            <Button
              id={`addG-${id}`}
              onClick={addGroup}
              size="sm"
              title="Add Group"
            >
              <AddGroupIcon />
            </Button>
          </ButtonGroup>
        </div>
        <RuleList rules={rules} onChange={handleFieldChange("rules")} />
        <GroupList groups={groups} onChange={handleFieldChange("groups")} />
      </FormGroup>
    );
  }
}

export default QueryGroup;
