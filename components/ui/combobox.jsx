"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Combobox({
  id,
  name,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  required,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between overflow-hidden"
            disabled={disabled}
          >
            <span className="truncate flex-1 text-left">
              {value
                ? options.find((option) => option.value === value)?.label || placeholder
                : placeholder}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ""}
        required={required}
      />
    </div>
  );
}



// "use client";

// import * as React from "react";
// import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// export function Combobox({
//   id,
//   name,
//   options,
//   placeholder,
//   value,
//   onChange,
//   disabled,
//   required,
// }) {
//   const [open, setOpen] = React.useState(false);

//   return (
//     <div>
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             role="combobox"
//             aria-expanded={open}
//             className="w-full justify-between"
//             disabled={disabled}
//           >
//             {value
//               ? options.find((option) => option.value === value)?.label || placeholder
//               : placeholder}
//             <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-full p-0">
//           <Command>
//             <CommandInput placeholder={placeholder} />
//             <CommandList className="max-h-[200px] overflow-y-auto">
//               <CommandEmpty>No option found.</CommandEmpty>
//               <CommandGroup>
//                 {options.map((option) => (
//                   <CommandItem
//                     key={option.value}
//                     value={option.value}
//                     onSelect={(currentValue) => {
//                       onChange(currentValue === value ? "" : currentValue);
//                       setOpen(false);
//                     }}
//                   >
//                     <CheckIcon
//                       className={cn(
//                         "mr-2 h-4 w-4",
//                         value === option.value ? "opacity-100" : "opacity-0"
//                       )}
//                     />
//                     {option.label}
//                   </CommandItem>
//                 ))}
//               </CommandGroup>
//             </CommandList>
//           </Command>
//         </PopoverContent>
//       </Popover>
//       <input
//         type="hidden"
//         id={id}
//         name={name}
//         value={value || ""}
//         required={required}
//       />
//     </div>
//   );
// }
