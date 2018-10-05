import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import styled from "styled-components";
import ReactModal from "react-modal-resizable-draggable";

const Wrapper = styled.div`
  height: 100%;
`;
const TitleBar = styled.div`
  height: ${props => props.theme.dialogTitleBarHeight};
`;
const Title = styled.h4`
  position: absolute;
  left: 0;
  z-index: 1;
  padding-left: 10px;
  padding-top: 10px;
  pointer-events: none;
`;
const CloseButton = styled(Button)`
  line-height: ${props => props.theme.lineHeightLg};
  position: absolute;
  right: 0;
  z-index: 1;
  &:hover {
    background-color: ${props => props.theme.danger} !important;
  }
`;
const Contents = styled.div`
  height: calc(100% - ${props => props.theme.dialogTitleBarHeight});
`;

const Dialog = ({ onClose, title, children, ...props }) => (
  <ReactModal {...props}>
    <Wrapper>
      <TitleBar>
        <CloseButton onClick={onClose} size="lg" close="true">
          &times;
        </CloseButton>
        <Title>{title}</Title>
      </TitleBar>
      <Contents>{children}</Contents>
    </Wrapper>
  </ReactModal>
);
Dialog.propTypes = {
  props: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.any,
  title: PropTypes.string
};

export default Dialog;
