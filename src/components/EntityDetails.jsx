import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ListGroup, ListGroupItem, Table } from "reactstrap";
import { RevealContainer, RevealButtonGroup, RevealButton } from "./Reveal";
import EntityToolbar from "./EntityToolbar";

const EntityHeaderWrapper = styled.div`
  background-color: ${props => props.theme.secondary};
  position: relative;
`;

export default class EntityDetails extends Component {
  static propTypes = {
    entity: PropTypes.object
  };

  render() {
    let { entity } = this.props;
    let { label, properties } = entity;
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
  }
}
