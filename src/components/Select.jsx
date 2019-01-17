import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import CreatableSelect from "react-select/lib/Creatable";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import * as themeProps from "../themes";

const getTheme = (state, props) => state.settings.general.theme;
const getStyles = createSelector([getTheme], name => {
  const appTheme = themeProps[name];
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: appTheme.inputBg,
      borderRadius: 0
    }),
    singleValue: provided => ({
      ...provided,
      color: appTheme.bodyColor
    }),
    input: provided => ({
      ...provided,
      color: appTheme.bodyColor
    }),
    option: (provided, state) => {
      return {
        ...provided,
        backgroundColor: state.isFocused
          ? appTheme.active
          : provided.backgroundColor,
        color: state.isFocused ? appTheme.activeColor : provided.color
      };
    },
    menu: (provided, state) => {
      return state.options.length === 0
        ? { width: 0, height: 0 }
        : { ...provided, background: appTheme.bodyBg };
    }
  };
});

const ThemedSelect = ({ styles, isCreateable, ...props }) =>
  isCreateable ? (
    <CreatableSelect styles={styles} {...props} />
  ) : (
    <Select styles={styles} {...props} />
  );

ThemedSelect.propTypes = {
  styles: PropTypes.object.isRequired,
  isCreateable: PropTypes.bool
};

function mapStateToProps(state, props) {
  return {
    styles: getStyles(state, props)
  };
}
export default connect(mapStateToProps, null)(ThemedSelect);
