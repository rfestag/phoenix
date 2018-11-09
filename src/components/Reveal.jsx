import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Button, ButtonGroup } from "reactstrap";
import { VisibleIcon, HiddenIcon } from "./Icons";

const UnstyledVisibility = ({ visible }) =>
  visible ? <VisibleIcon /> : <HiddenIcon />;
UnstyledVisibility.propTypes = {
  visible: PropTypes.bool
};

export const RevealContainer = styled.div`
  height: 100%;
`;
export const RevealVisibilityElement = styled(UnstyledVisibility)`
  visibility: ${props => (props.visible ? "visible" : "hidden")};
  ${RevealContainer}:hover & {
    visibility: visible;
  }
`;

export const Reveal = styled.div`
  position: absolute;
  top: -3px;
  left: 0;
  z-index: 2;
  color: ${props =>
    props.visible ? props.theme.accentColor : props.theme.accentFaded};
  visibility: ${props => (props.visible ? "visible" : "hidden")};
  ${RevealContainer}:hover & {
    visibility: visible;
  }
  &:hover {
    color: ${props => props.theme.accentColor};
  }
`;
export const RevealButtonGroup = styled(ButtonGroup)`
  visibility: hidden;
  ${RevealContainer}:hover & {
    visibility: visible;
  }
`;
export const RevealButton = styled(Button)`
  border-radius: 50% !important;
`;
export const RevealVisibility = ({ visible }) => (
  <Reveal visible={visible}>
    <RevealVisibilityElement visible={visible} />
  </Reveal>
);
RevealVisibility.propTypes = {
  visible: PropTypes.bool
};
