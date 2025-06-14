import React from "react";
import { PropTypes } from "prop-types";
import { Label } from "@/components/ui/label";
import { defimg } from "@/utils/resize-crop-image";

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
        src={imgSrc || defimg}
        alt='picture preview'
        crossOrigin='anonymous'
        className={`rounded-xl shadow ${imgClass}`}
      />
    </div>
  );
};

FormImagePreview.propTypes = {
  imgSrc: PropTypes.string,
  labelClass: PropTypes.string,
  imgClass: PropTypes.string,
  size: PropTypes.number,
  label: PropTypes.string,
  underLine: PropTypes.bool,
  required: PropTypes.bool,
};
export default FormImagePreview;
