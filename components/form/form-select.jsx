import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PropTypes from "prop-types";
import React from "react";

const demo = [
  {
    value: "male",
    data: "Male",
  },
  {
    value: "female",
    data: "Female",
  },
];

const FormSelect = ({
  onCallbackSelect,
  mainClass,
  labelClass,
  optID,
  optLabel,
  label = "Gender",
  item = demo,
  isLabel = true,
}) => {
  const filter = (item || []).map((d) => ({
    value: d[optID],
    label: d[optLabel],
  }));

  const handleSelect = (event) => {
    onCallbackSelect(event);
  };
  return (
    <div className={`flex flex-col gap-2 ${mainClass}`}>
      {isLabel ? <Label className={labelClass}>{label}</Label> : ""}
      <Select onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder={`Set ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {filter?.map((d, i) => (
            <SelectItem key={i} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

FormSelect.propTypes = {
  onCallbackSelect: PropTypes.func,
  mainClass: PropTypes.string,
  labelClass: PropTypes.string,
  optID: PropTypes.string,
  optLabel: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.number,
  label: PropTypes.string,
  isLabel: PropTypes.bool,
  item: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
    })
  ),
};

export default FormSelect;
