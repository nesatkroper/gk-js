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
            className="justify-between truncate w-full"
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
                    className='truncate'
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

