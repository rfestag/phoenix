import React from "react";
import PropTypes from "prop-types";
import { Input } from "reactstrap";
import Select from "./Select";

const options = [
  { label: "sec", value: "seconds" },
  { label: "min", value: "minutes" },
  { label: "hrs", value: "hours" },
  { label: "days", value: "days" }
];
const Ageoff = ({ value, onChange, name, placeholder, children }) => {
  const durationValue = value.value;
  const unit = value.unit;
  const unitOpt = options.find(opt => opt.value === unit);
  const invalid = durationValue < 0;
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Input
          value={durationValue}
          type="numeric"
          name={name}
          placeholder={placeholder}
          onChange={e => onChange({ value: Number(e.target.value), unit })}
          invalid={invalid}
        />
        <div style={{ width: 150 }}>
          <Select
            options={options}
            value={unitOpt}
            onChange={opt =>
              onChange({ value: durationValue, unit: opt.value })
            }
          />
        </div>
      </div>
      {children}
    </div>
  );
};

Ageoff.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  children: PropTypes.any
};
export default Ageoff;
