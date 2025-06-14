import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PropTypes from "prop-types";
import React from "react";

const FormTextArea = ({
  onCallbackInput,
  name,
  value,
  mainClass,
  inputClass,
  labelClass,
  placeholder = "Food, Drink, ...",
  label = "Email*",
  rows = 6,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onCallbackInput(name, value === "" ? null : value);
  };

  const handleFocus = () => {
    if (value === null || value === "N/A") {
      onCallbackInput(name, "");
    }
  };

  const handleBlur = () => {
    if (value === "") {
      onCallbackInput(name, "N/A");
    }
  };

  return (
    <div className={`flex flex-col gap-2 justify-between mb-2 ${mainClass}`}>
      <Label className={`${labelClass}`}>{label}</Label>
      <Textarea
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        name={name}
        value={value === null || value === "" ? "N/A" : value}
        placeholder={placeholder}
        className={`${inputClass}`}
        rows={rows}
      />
    </div>
  );
};

FormTextArea.propTypes = {
  onCallbackInput: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.string,
  mainClass: PropTypes.string,
  inputClass: PropTypes.string,
  labelClass: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.number,
  label: PropTypes.string,
  rows: PropTypes.number,
};

export default FormTextArea;
