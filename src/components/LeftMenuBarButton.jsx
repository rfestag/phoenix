import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Button } from "reactstrap";

const StyledIcon = styled(FontAwesomeIcon)`
  background-color: rgba(255, 255, 255, 0);
  border: none;
  color: inherit;

  display: block;
  position: absolute;
  left: 50%;
  height: 50%;
  transform: translate(-50%, -50%);
  &:hover,
  &.active {
    background: none;
  }
`;

const StyledButton = styled.div`
  color: ${props => props.theme.buttonInactiveColor};
  height: 36px;
  width: 36px;
  position: relative;
  text-align: center;
  line-height: 50%;
  border: none;

  &:hover,
  &.active {
    color: ${props => props.theme.buttonHoverColor};
    background-color: rgba(255, 255, 255, 0.1);
  }
  &:focus,
  &.active {
    border-left: 3px solid ${props => props.theme.accentColor} !important;
  }
`;

const LeftMenuBarButton = ({ icon, active, onClick }) => (
  <StyledButton className={classnames({ active })} onClick={onClick}>
    <Button
      style={{
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "inherit",
        color: "inherit"
      }}
    >
      <StyledIcon icon={icon} size="lg" />
    </Button>
  </StyledButton>
);
LeftMenuBarButton.propTypes = {
  icon: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.any
};
export default LeftMenuBarButton;
