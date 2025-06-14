import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
  onCallbackSelect = null,
  optID = "time",
  optLabel = "less",
  labelClass = "",
  label = "Email*",
  item = [
    { time: "next.js", less: "Next.js" },
    { time: "sveltekit", less: "SvelteKit" },
  ],
  defaultValue = "",
  error,
  className,
  required,
}) => {
  const filter = (item || []).map((d) => ({
    value: String(d[optID]),
    label: d[optLabel] || "",
  }));

  const [open, setOpen] = useState(false);
  const [data, setData] = useState(
    defaultValue || (filter.length > 0 ? filter[0].value : "")
  );

  useEffect(() => {
    if (onCallbackSelect && data) onCallbackSelect(data);
  }, []);

  return (
    <div className={className}>
      <Label className={labelClass}>
        {label} {required ? <span className='text-red-700'>*</span> : ""}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='justify-between w-full'>
            {data
              ? filter.find((d) => d.value === data)?.label ||
                `Select ${label}...`
              : `Select ${label}...`}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0 w-full'>
          <Command
            filter={(value, search) => {
              const item = filter.find((f) => f.value === value);
              if (!item) return 0;
              return item.label.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0;
            }}>
            <CommandInput
              placeholder={`Search ${label}...`}
              className='h-9'
              aria-label={`Search for ${label}`}
            />
            <CommandList className='max-h-[200px] overflow-y-auto overflow-x-hidden'>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {filter.map((d) => (
                  <CommandItem
                    key={d.value}
                    value={d.value}
                    onSelect={(currentValue) => {
                      setData(currentValue);
                      setOpen(false);
                      onCallbackSelect?.(currentValue);
                    }}>
                    {d.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        data === d.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};

FormComboBox.propTypes = {
  onCallbackSelect: PropTypes.func,
  optID: PropTypes.string,
  optLabel: PropTypes.string,
  labelClass: PropTypes.string,
  size: PropTypes.number,
  label: PropTypes.string,
  error: PropTypes.string,
  item: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
  defaultValue: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export default FormComboBox;
