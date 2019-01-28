import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import _ from "lodash";
import {
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Table
} from "reactstrap";
import { Media } from "reactstrap";
import {
  RevealVisibility,
  RevealContainer,
  RevealButtonGroup,
  RevealButton
} from "./Reveal";
import EntityToolbar from "./EntityToolbar";

const EntityHeaderWrapper = styled.div`
  background-color: ${props => props.theme.secondary};
  position: relative;
`;
const Header = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.secondary};
`;

export default class EntityDetails extends Component {
  static propTypes = {
    entity: PropTypes.object
  };

  render() {
    let { entity } = this.props;
    let { id, label, when, properties } = entity;
    let fields = Object.keys(properties).sort();
    console.log(entity);
    return (
      <div>
        <ListGroup>
          <EntityHeaderWrapper>
            <RevealContainer>
              <ListGroupItem>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "inline-block",
                    border: "1px solid gray"
                  }}
                >
                  <img alt="" style={{ width: "100%", height: "100%" }} />
                </div>
                <h4
                  style={{
                    display: "inline-block",
                    position: "absolute",
                    marginLeft: 6,
                    top: 12,
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  {label}
                </h4>
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 6,
                    top: 6,
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  Aircraft
                </span>
                <RevealButtonGroup style={{ float: "right" }}>
                  <RevealButton>A</RevealButton>
                </RevealButtonGroup>
              </ListGroupItem>
            </RevealContainer>
          </EntityHeaderWrapper>
        </ListGroup>
        <EntityToolbar />
        <Table size="sm" striped borderless hover>
          <thead>
            <tr>
              <th>Field</th>
              <th>Last Value</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f}>
                <td>{f}</td>
                <td>{properties[f].last}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
    return <span>{id}</span>;
  }
}
