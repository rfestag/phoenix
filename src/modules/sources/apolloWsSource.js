import * as fetch from "cross-fetch";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { Source } from "./source";

/**
 *
 * @class {WebsocketSource}
 */
export class ApolloWsSource extends Source {
  constructor(name, { uri, wsUri }) {
    super(name);
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

    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache()
    });
  }

  dictionary() {
    super.dictionary();
  }
  query(def) {
    super.query(def);
  }

  /**
   * @return {Observable} An Observable indicating whether this source is "available"
   */
  health() {
    true;
  }
}
