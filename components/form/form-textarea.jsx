"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const FormTextArea = ({
  onCallbackInput,
  name,
  value,
  mainClass = "",
  inputClass = "",
  labelClass = "",
  placeholder = "Type here...",
  label = "Text Area",
  rows = 6,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onCallbackInput?.(name, value.trim() === "" ? null : value);
  };

  const handleFocus = () => {
    if (value === null || value === "N/A") {
      onCallbackInput?.(name, "");
    }
  };

  const handleBlur = () => {
    if (value === "") {
      onCallbackInput?.(name, "N/A");
    }
  };

  return (
    <div className={`flex flex-col gap-2 mb-2 ${mainClass}`}>
      <Label htmlFor={name} className={labelClass}>
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        value={value === null || value === "" ? "N/A" : value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
};

export default FormTextArea;
