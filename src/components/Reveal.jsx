import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup } from "reactstrap";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

library.add(faEye, faEyeSlash);

const UnstyledVisibility = ({ visible }) => (
  <FontAwesomeIcon icon={visible ? "eye" : "eye-slash"} />
);
UnstyledVisibility.propTypes = {
  visible: PropTypes.bool
};

const RevealVisibilityElement = styled(UnstyledVisibility)`
  visibility: ${props => (props.visible ? "visible" : "hidden")};
  ${RevealContainer}:hover & {
    visibility: visible;
  }
`;
const RevealButtonElement = styled(Button)`
  ${RevealContainer}:hover & {
    visibility: visible;
  }
`;
export const RevealContainer = styled.div`
  height: 100%;
`;

const Reveal = styled.div`
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
