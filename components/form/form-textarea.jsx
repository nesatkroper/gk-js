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



// "use client"

// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import React from "react";

// const FormTextArea = ({
//   onCallbackInput,
//   name,
//   value,
//   mainClass,
//   inputClass,
//   labelClass,
//   placeholder = "Food, Drink, ...",
//   label = "Email*",
//   rows = 6,
// }) => {
//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     onCallbackInput(name, value === "" ? null : value);
//   };

//   const handleFocus = () => {
//     if (value === null || value === "N/A") {
//       onCallbackInput(name, "");
//     }
//   };

//   const handleBlur = () => {
//     if (value === "") {
//       onCallbackInput(name, "N/A");
//     }
//   };

//   return (
//     <div className={`flex flex-col gap-2 justify-between mb-2 ${mainClass}`}>
//       <Label className={`${labelClass}`}>{label}</Label>
//       <Textarea
//         onChange={handleChange}
//         onFocus={handleFocus}
//         onBlur={handleBlur}
//         name={name}
//         value={value === null || value === "" ? "N/A" : value}
//         placeholder={placeholder}
//         className={`${inputClass}`}
//         rows={rows}
//       />
//     </div>
//   );
// };


// export default FormTextArea;
