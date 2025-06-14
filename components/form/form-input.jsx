"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

const FormInput = ({
  onCallbackInput,
  name,
  value = "",
  type = "text",
  className = "",
  placeholder = "",
  label = "Input",
  readonly = false,
  required = false,
  min,
  step,
  error,
  disabled = false,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onCallbackInput?.(name, value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        readOnly={readonly}
        required={required}
        min={min}
        step={step}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;



// "use client"

// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import React from "react";

// const FormInput = ({
//   onCallbackInput,
//   name,
//   value,
//   type = "text",
//   className,
//   placeholder = "someone@ok.com",
//   label = "Email",
//   readonly = false,
//   required = false,
//   min = 0,
//   step = 0.01,
//   error,
//   disabled,
// }) => {
//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     onCallbackInput(name, value);
//   };

//   return (
//     <div className='space-y-2'>
//       <Label htmlFor={name} id={name}>
//         {label} {required ? <span className='text-red-600'>*</span> : ""}
//       </Label>
//       <Input
//         onChange={handleChange}
//         id={name}
//         value={value}
//         name={name}
//         type={type}
//         placeholder={placeholder}
//         className={className}
//         readOnly={readonly}
//         min={min}
//         step={step}
//         required={required}
//         disabled={disabled}
//       />
//       {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
//     </div>
//   );
// };


// export default FormInput;
