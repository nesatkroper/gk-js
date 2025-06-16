"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const FormDatePicker = ({
  onCallbackPicker,
  label = "Date of Birth*",
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  error,
}) => {
  const [date, setDate] = React.useState(null)
  const [open, setOpen] = React.useState(false)

  const handlePicker = (selectedDate) => {
    setDate(selectedDate)
    if (onCallbackPicker) {
      onCallbackPicker(selectedDate)
    }
    console.log(selectedDate)
    setOpen(false)
  }

  return (
    <div className='space-y-2'>
      <Label htmlFor="date">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn(
              `w-full justify-between font-normal`,
              !date && "text-muted-foreground"
            )}
          >
            {date ? format(date, "PPP") : "Select date"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handlePicker}
            fromDate={new Date(fromYear, 0, 1)}
            toDate={new Date(toYear, 11, 31)}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default FormDatePicker
