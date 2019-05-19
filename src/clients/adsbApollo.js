import gql from "graphql-tag";
import * as fetch from "cross-fetch";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { InMemoryCache } from "apollo-cache-inmemory";
import { from, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import _ from "lodash";

const uri = "http://localhost:4000/graphql";
const wsUri = "ws://localhost:4000/subscriptions";

const httpLink = new HttpLink({ uri, fetch });
const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true
  }
});

const handler = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);
const error = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const link = from([error, handler]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

function toGql(query) {
  let { type, rules, field, op, values } = query;
  field = field ? field.field || field : field;
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
    if (op === "exists") {
      return `{field: ${field}, op: ${op}}`;
    } else if (values) {
      values = `[${values.map(v => `"${v}"`)}]`;
      return `{field: ${field}, op: ${op}, values: ${values}}`;
    }
  }
  return "";
}

export const toParams = args => {
  let params = _.reduce(
    args,
    (params, v, k) => {
      let gqlStr = toGql(v);
      if (gqlStr !== "") params.push(`${k}: ${gqlStr}`);
      return params;
    },
    []
  );
  return params.length > 0 ? `(${params.join(",")})` : "";
};
const Api = {
  aircraft: (q = {}, opts = {}) => {
    q = `query: ${toGql(q)}`;
    opts = `options: ${toGql(opts)}`;
    let params = [];
    if (q !== "query: ") params.push(q);
    if (opts !== "options: ") params.push(opts);
    params = params.join(",");
    if (params !== "") params = `(${params})`;
    const query = gql`
      query {
        aircraft${params} {
          ModeS,
          ModeSCountry,
          Registration,
          Manufacturer,
          ICAOTypeCode,
          Type,
          SerialNo,
        }
      }
    `;
    return client.query({ query });
  },
  countAircraft: (q = {}, opts = {}) => {
    const query = gql`
      query {
        aircraftCount(query: ${toGql(q)}, options: ${toGql(opts)})
      }
    `;
    return client.query({ query });
  },
  aircraftTypes: (q = {}, opts = {}) => {
    const query = gql`
      query {
        aircraftTypes(query: ${toGql(q)}, options: ${toGql(opts)})
      }
    `;
    return client.query({ query });
  },
  countries: () => {
    const query = gql`
      query {
        countries
      }
    `;
    return client.query({ query });
  },
  codeBlocks: () => {
    const query = gql`
      query {
        codeBlocks {
          Country
          BitMask
          SignificantBitMask
          IsMilitary
        }
      }
    `;
    return client.query({ query });
  }
};

export default Api;
