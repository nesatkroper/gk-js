"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const FormImagePreview = ({
  imgSrc = "",
  width = 200,
  height = 200,
  label = "Picture Preview",
  underLine = false,
  required,
}) => {
  const src = imgSrc || "/placeholder.svg"; // ✅ use public path

  return (
    <div className="space-y-2">
      <Label className={`${underLine ? "underline" : ""}`}>
        {label} {required && <span className="text-red-700">*</span>}
      </Label>
      <div className='relative '>
        <Image
          src={src}
          alt="picture preview"
          width={width}
          height={height}
          className="rounded-xl shadow object-cover"
        />
      </div>
    </div>
  );
};

export default FormImagePreview;

