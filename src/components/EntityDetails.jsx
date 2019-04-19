import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ListGroup, ListGroupItem, Table } from "reactstrap";
import { RevealContainer, RevealButtonGroup, RevealButton } from "./Reveal";
import EntityToolbar from "./EntityToolbar";
import PerfectScrollbar from "react-perfect-scrollbar";
import { UNIT_TYPES } from "../modules/sources/Constants";

const EntityHeaderWrapper = styled.div`
  background-color: ${props => props.theme.secondary};
  position: relative;
`;

export default class EntityDetails extends Component {
  static propTypes = {
    entity: PropTypes.object,
    propertyDefs: PropTypes.array
  };

  suffix = field => {
    let { propertyDefs } = this.props;
    let def = propertyDefs[field];
    let unitType = UNIT_TYPES[def._unitType];
    if (unitType) {
      let unit = unitType[def._unit];
      if (unit) return `(${unit.abbrv})`;
    }
    return undefined;
  };
  render() {
    let { suffix, props } = this;
    let { entity, propertyDefs } = props;
    let { label, properties } = entity;
    let fields = Object.keys(properties).sort();
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <ListGroup>
          <EntityHeaderWrapper>
            <RevealContainer>
              <ListGroupItem>
                <div style={{ display: "inline-block" }}>
                  <div style={{ display: "flex" }}>
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
                    <div style={{ paddingLeft: 8, flex: 1 }}>
                      <h4
                        style={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          margin: 0,
                          lineHeight: 1
                        }}
                      >
                        {label}
                      </h4>
                      <div
                        style={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          lineHeight: 1
                        }}
                      >
                        Aircraft
                      </div>
                    </div>
                  </div>
                </div>
                <RevealButtonGroup style={{ float: "right" }}>
                  <RevealButton>A</RevealButton>
                </RevealButtonGroup>
              </ListGroupItem>
            </RevealContainer>
          </EntityHeaderWrapper>
        </ListGroup>
        <EntityToolbar />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <PerfectScrollbar>
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
                    <td title={propertyDefs[f]._description}>{f}</td>
                    <td>
                      {properties[f].value} <em>{suffix(f)}</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </PerfectScrollbar>
        </div>
      </div>
    );
  }
}
