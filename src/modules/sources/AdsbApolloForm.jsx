import React from "react";
import PropTypes from "prop-types";
import BooleanQueryBuilder from "../../components/BooleanQueryBuilder";
import gql from "graphql-tag";
import * as fetch from "cross-fetch";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { Source } from "./source";

const uri = "http://localhost:4000/graphql";
const wsUri = "ws://localhost:4000/subscriptions";

const httpLink = new HttpLink({ uri, fetch });
const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true
  }
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

function toGql(query) {
  let { type, rules, field, op, value } = query;
  let parsed;
  if (type === "and") {
    parsed = rules.map(toGql).join(",");
    return parsed.length ? `{and:[${parsed}]}` : "";
  }
  if (type === "or") {
    parsed = rules.map(toGql).join(",");
    return rules.length ? `{or:[${parsed}]}` : "";
  }
  if (field && op) {
    console.log(field, op, value);
    field = field.field;
    if (op === "exists") {
      return `{field: ${field}, op: ${op}}`;
    } else if (value) {
      value = `[${value.map(v => `"${v}"`)}]`;
      return `{field: ${field}, op: ${op}, values: ${value}}`;
    }
  }
  return "";
}
let aircraftFields = [
  "ModeS",
  "FirstCreated",
  "LastModified",
  "ModeSCountry",
  "Country",
  "Registration",
  "Manufacturer",
  "ICAOTypeCode",
  "Type",
  "SerialNo",
  "RegisteredOwners",
  "Interested",
  "UserTag"
];
let aircraftTypeFields = [
  "Icao",
  "WakeTurbulence",
  "Species",
  "EngineType",
  "EnginePlacement",
  "Engines",
  "Model",
  "Manufacturer"
];
let aircraftOptions = aircraftFields.map(f => ({ headerName: f, field: f }));
let aircraftTypeOptions = aircraftTypeFields.map(f => ({
  headerName: f,
  field: f
}));
class AdsbQueryForm extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  handleFormChange = field => (event, value, key) => {
    console.log("TODO: parse ", toGql(value));
    let searchTerms = toGql(value);
    if (searchTerms.length > 0) {
      const countQuery = gql`
        query {
          aircraftCount(query: ${searchTerms})
        }
      `;

      let results = client
        .query({
          query: countQuery
        })
        .then(d => console.log(d.data.aircraftCount))
        .catch(e => console.error(e))
        .finally(d => console.log(d));
      console.log(results);
    }
    let data = { ...this.props.data };
    data[field] = value;
    this.props.onChange(event, data, key);
  };
  render() {
    //We do this to ensure we don't use the onChange passed by the parent
    let { onChange, data, ...props } = this.props;
    let { handleFormChange } = this;
    return (
      <div>
        <h4>Mode-S Data</h4>
        <BooleanQueryBuilder
          fields={aircraftOptions}
          group={data.data}
          onChange={handleFormChange("data")}
          {...props}
        />
        <h4>Aircraft Information</h4>
        <BooleanQueryBuilder
          fields={aircraftOptions}
          group={data.acft}
          onChange={handleFormChange("acft")}
          {...props}
        />
        <h4>Aircraft Type Information</h4>
        <BooleanQueryBuilder
          fields={aircraftTypeOptions}
          group={data.acftType}
          onChange={handleFormChange("acftType")}
          {...props}
        />
      </div>
    );
  }
}

export default AdsbQueryForm;
