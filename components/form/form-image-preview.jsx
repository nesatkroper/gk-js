"use client"

import React from "react";
import { PropTypes } from "prop-types";
import { Label } from "@/components/ui/label";

const FormImagePreview = ({
  imgSrc = "",
  labelClass = "",
  imgClass = "",
  label = "Picture Preview",
  underLine = false,
  required,
}) => {
  return (
    <div className='columns-1'>
      <Label className={`${labelClass} ${underLine ? "underline" : ""}`}>
        {label} {required ? <span className='text-red-700'>*</span> : ""}
      </Label>
      <img
        src={imgSrc || './placeholder.svg'}
        alt='picture preview'
        crossOrigin='anonymous'
        className={`rounded-xl shadow ${imgClass}`}
      />
    </div>
  );
};

export default FormImagePreview;
