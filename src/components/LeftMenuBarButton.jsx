import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Button } from "reactstrap";

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

const LeftMenuBarButton = ({ icon, active, onClick, children }) => (
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
      {children}
    </Button>
  </StyledButton>
);
LeftMenuBarButton.propTypes = {
  icon: PropTypes.string.isRequired,
  active: PropTypes.bool,
  children: PropTypes.any,
  onClick: PropTypes.any
};
export default LeftMenuBarButton;
