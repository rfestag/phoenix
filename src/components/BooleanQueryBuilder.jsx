import React from "react";
import PropTypes from "prop-types";
import uuid from "uuid/v4";
import { Button, ButtonGroup, FormGroup } from "reactstrap";
import { DeleteIcon, AddGroupIcon, AddRuleIcon } from "./Icons";
import Select from "./Select";

class RuleList extends React.Component {
  static propTypes = {
    fields: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    rules: PropTypes.array.isRequired
  };
  handleFieldChange = index => value => {
    let data = [...this.props.rules];
    data[index] = value;
    this.props.onChange(data);
  };
  handleFieldRemove = index => value => {
    let data = [...this.props.rules];
    data.splice(index, 1);
    this.props.onChange(data);
  };
  render() {
    let { rules, fields } = this.props;
    return (
      <div style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4 }}>
        {rules.map((rule, index) => (
          <Rule
            key={rule.id}
            rule={rule}
            fields={fields}
            onChange={this.handleFieldChange(index)}
            onRemove={this.handleFieldRemove(index)}
            canRemove={true}
          />
        ))}
      </div>
    );
  }
}
class GroupList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
    fields: PropTypes.array
  };
  handleFieldChange = index => value => {
    let data = [...this.props.groups];
    data[index] = value;
    this.props.onChange(data);
  };
  handleFieldRemove = index => value => {
    let data = [...this.props.groups];
    data.splice(index, 1);
    this.props.onChange(data);
  };
  render() {
    let { groups } = this.props;
    return (
      <div style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4 }}>
        {groups.map((group, index) => (
          <QueryGroup
            key={group.id}
            group={group}
            fields={this.props.fields}
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
  { label: "EXISTS", value: "exists" },
  { label: "CONTAINS", value: "contains" },
  { label: "STARTSWITH", value: "startsWith" },
  { label: "ENDSWITH", value: "endsWith" },
  { label: "=", value: "eq" },
  { label: "<", value: "gt" },
  { label: "<=", value: "gte" },
  { label: ">", value: "lt" },
  { label: ">=", value: "lte" }
];
class Rule extends React.Component {
  static propTypes = {
    rule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    canRemove: PropTypes.bool.isRequired,
    fields: PropTypes.array
  };
  setField = value => {
    let rule = { ...this.props.rule };
    rule.field = value ? value.value : value;
    this.props.onChange(rule);
  };
  createField = value => {
    let rule = { ...this.props.rule };
    rule.field = { headerName: value, field: value };
    this.props.onChange(rule);
  };
  setOp = value => {
    if (value) {
      let rule = { ...this.props.rule };
      rule.op = value.value;
      this.props.onChange(rule);
    }
  };
  setValue = values => {
    if (values) {
      let rule = { ...this.props.rule };
      rule.values = values.map(v => v.value);
      this.props.onChange(rule);
    }
  };
  createValue = value => {
    let rule = { ...this.props.rule };
    rule.values = rule.values ? [...rule.values] : [];
    rule.values.push(value);
    this.props.onChange(rule);
  };
  isValid = input => {
    //Yea, this seems dumb. For whatever reason, without it, the bowels
    //of react-select try to convert the value to a lowercase string.
    //Adding this so that "falsey" values are treated as invalid
    return input;
  };
  render() {
    const { canRemove, onRemove, rule, fields } = this.props;
    const { field, op, values } = rule;
    const {
      setField,
      createField,
      setOp,
      setValue,
      createValue,
      isValid
    } = this;

    let fieldsList = fields
      ? fields.map(f => ({ label: f.headerName, value: f }))
      : [];
    let fieldOption = field ? { label: field.headerName, value: field } : null;
    let opOption = op ? operations.find(o => o.value === op) : null;
    let valueOption = values ? values.map(v => ({ label: v, value: v })) : null;

    return (
      <div
        style={{ display: "flex", flexDirection: "column", paddingBottom: 6 }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <Select
              placeholder="Field..."
              options={fieldsList}
              value={fieldOption}
              isValidNewOption={isValid}
              onCreateOption={createField}
              onChange={setField}
              isClearable
              isCreateable
            />
          </div>
          <div style={{ width: 170 }}>
            <Select value={opOption} options={operations} onChange={setOp} />
          </div>
          {canRemove && (
            <Button onClick={onRemove} size="sm" title="Remove">
              <DeleteIcon />
            </Button>
          )}
        </div>
        <Select
          placeholder="Value(s)..."
          value={valueOption}
          onCreateOption={createValue}
          onChange={setValue}
          isMulti
          isCreateable
        />
      </div>
    );
  }
}

class QueryGroup extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    group: PropTypes.object.isRequired,
    fields: PropTypes.array,
    onRemove: PropTypes.func,
    canRemove: PropTypes.bool
  };
  handleFieldChange = field => value => {
    let data = { ...this.props.group };
    data[field] = value;
    // you could pass the event here but also null if it is not necessary nor useful
    this.props.onChange(data);
  };
  setType = this.handleFieldChange("type");
  setAnd = () => {
    this.setType("and");
  };
  setOr = () => {
    this.setType("or");
  };
  changeRules = this.handleFieldChange("rules");
  changeGroups = this.handleFieldChange("groups");
  addRule = () => {
    let rules = [...this.props.group.rules];
    let rule = { id: uuid(), op: "in" };
    rules.push(rule);
    this.changeRules(rules);
  };
  addGroup = () => {
    let groups = [...this.props.group.groups];
    let group = {
      id: uuid(),
      type: "and",
      rules: [{ id: uuid(), op: "in" }],
      groups: []
    };
    groups.push(group);
    this.changeGroups(groups);
  };
  render() {
    let { group, fields, onRemove, canRemove } = this.props;
    let { id, type, rules, groups } = group;
    let { setAnd, setOr, addRule, addGroup, changeGroups, changeRules } = this;
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
        <RuleList rules={rules} fields={fields} onChange={changeRules} />
        <GroupList groups={groups} fields={fields} onChange={changeGroups} />
      </FormGroup>
    );
  }
}

export default QueryGroup;
