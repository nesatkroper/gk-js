"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const FormComboBox = ({
  name,
  onCallbackSelect = null,
  optID = "time",
  optLabel = "less",
  label = "Framework",
  defaultValue = "",
  error = "",
  required = false,
  item = [
    { time: "next.js", less: "Next.js" },
    { time: "sveltekit", less: "SvelteKit" },
  ],
}) => {
  const options = useMemo(() => {
    return (item || []).map((d) => ({
      value: String(d[optID]),
      label: d[optLabel] || "",
    }));
  }, [item, optID, optLabel]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    defaultValue || (options.length > 0 ? options[0].value : "")
  );

  const handleSelect = useCallback(
    (value) => {
      setSelected(value);
      setOpen(false);
      if (onCallbackSelect) onCallbackSelect(value);
    },
    [onCallbackSelect]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-700">*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            {selected
              ? options.find((d) => d.value === selected)?.label
              : `Select ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-full">
          <Command>
            <CommandInput
              placeholder={`Search ${label}...`}
              className="h-9"
              aria-label={`Search for ${label}`}
            />
            <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden">
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {options.map((d) => (
                  <CommandItem
                    key={d.value}
                    value={d.value}
                    onSelect={handleSelect}
                  >
                    {d.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selected === d.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormComboBox;



// "use client"

// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { Check, ChevronsUpDown } from "lucide-react";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";

// const FormComboBox = ({
//   name,
//   onCallbackSelect = null,
//   optID = "time",
//   optLabel = "less",
//   label = "Framework",
//   defaultValue = "",
//   error,
//   required,
//   item = [
//     { time: "next.js", less: "Next.js" },
//     { time: "sveltekit", less: "SvelteKit" },
//   ],
// }) => {
//   const filter = (item || []).map((d) => ({
//     value: String(d[optID]),
//     label: d[optLabel] || "",
//   }));

//   const [open, setOpen] = useState(false);
//   const [data, setData] = useState(
//     defaultValue || (filter.length > 0 ? filter[0].value : "")
//   );

//   const handleSelect = useCallback((v) => …[setData, onCallbackSelect]);

//   // useEffect(() => {
//   //   if (onCallbackSelect && data) onCallbackSelect(data);
//   // }, []);

//   return (
//     <div className='space-y-2'>
//       <Label htmlFor={name} id={name}>
//         {label} {required ? <span className='text-red-700'>*</span> : ""}
//       </Label>
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant='outline'
//             role='combobox'
//             aria-expanded={open}
//             className='justify-between w-full'>
//             {data
//               ? filter.find((d) => d.value === data)?.label ||
//               `Select ${label}...`
//               : `Select ${label}...`}
//             <ChevronsUpDown className='opacity-50' />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className='p-0 w-full'>
//           <Command
//             filter={(value, search) => {
//               const item = filter.find((f) => f.value === value);
//               if (!item) return 0;
//               return item.label.toLowerCase().includes(search.toLowerCase())
//                 ? 1
//                 : 0;
//             }}>
//             <CommandInput
//               placeholder={`Search ${label}...`}
//               className='h-9'
//               aria-label={`Search for ${label}`}
//             />
//             <CommandList className='max-h-[200px] overflow-y-auto overflow-x-hidden'>
//               <CommandEmpty>No {label} found.</CommandEmpty>
//               <CommandGroup>
//                 {filter.map((d) => (
//                   <CommandItem
//                     key={d.value}
//                     value={d.value}
//                     onSelect={(currentValue) => {
//                       setData(currentValue);
//                       setOpen(false);
//                       onCallbackSelect?.(currentValue);
//                     }}>
//                     {d.label}
//                     <Check
//                       className={cn(
//                         "ml-auto h-4 w-4",
//                         data === d.value ? "opacity-100" : "opacity-0"
//                       )}
//                     />
//                   </CommandItem>
//                 ))}
//               </CommandGroup>
//             </CommandList>
//           </Command>
//         </PopoverContent>
//       </Popover>
//       {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
//     </div>
//   );
// };


// export default FormComboBox;
