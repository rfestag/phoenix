import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const CollapseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const CollapseHeader = styled.h3`
  background-color: ${props =>
    props.active
      ? props.theme.componentActiveBg
      : props.theme.collapseHeaderBg};
  color: ${props =>
    props.active ? props.theme.componentActiveColor : props.theme.bodyColor};
  margin: 0;
  padding: 5px;
  &:hover: {
    background-color: ${props => props.theme.collapseHeaderHoverBg};
    color: ${props => props.theme.collapseHeaderHoverBg};
  }
`;

export class SwitchableCollapse extends Component {
  constructor(props) {
    super(props);
    this.state = { pane: props.defaultPane };
  }
  setOpenPane = name => {
    this.setState({ pane: name });
  };
  render() {
    const { children } = this.props;
    const self = this;

    React.Children.forEach(c => console.log(c));
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, {
        open: self.state.pane === child.props.name,
        onHeaderClick: () => self.setOpenPane(child.props.name)
      })
    );
    return <CollapseWrapper>{childrenWithProps}</CollapseWrapper>;
  }
}

SwitchableCollapse.propTypes = {
  defaultPane: PropTypes.string,
  children: PropTypes.any
};
