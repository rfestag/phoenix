import React from "react";
import PropTypes from "prop-types";
import { Input, FormText } from "reactstrap";
import Select from "./Select";

const options = [
  { label: "sec", value: "seconds" },
  { label: "min", value: "minutes" },
  { label: "hrs", value: "hours" },
  { label: "days", value: "days" }
];
const Ageoff = ({ value, onChange }) => {
  const { ageoff, unit } = value;
  const unitOpt = options.find(opt => opt.value === unit);
  const invalid = ageoff < 0;
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Input
          value={ageoff}
          type="numeric"
          name="ageoff"
          id="ageoff"
          placeholder="Ageoff (blank means no ageoff)"
          onChange={e => onChange({ ageoff: e.target.value, unit })}
          invalid={invalid}
        />
        <div style={{ width: 150 }}>
          <Select
            options={options}
            value={unitOpt}
            onChange={opt => onChange({ ageoff, unit: opt.value })}
          />
        </div>
      </div>
      <FormText>Ageoff must be positive or blank</FormText>
    </div>
  );
};

Ageoff.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired
};
export default Ageoff;
