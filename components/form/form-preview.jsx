"use client"

import React from "react";
import { Label } from "@/components/ui/label";
import PropTypes from "prop-types";

const FormPreview = ({
  label = "Full Name",
  value = "Phanun",
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-2 ${className}`}>
      <Label>{label}</Label>
      <Label>: {value}</Label>
    </div>
  );
};

FormPreview.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  className: PropTypes.string,
};

export default FormPreview;
