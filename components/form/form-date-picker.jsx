"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import React, { useState } from "react"

const FormDatePicker = ({
  onCallbackPicker,
  mainClass,
  labelClass,
  label = "Date of Birth*",
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  error,
}) => {
  const [date, setDate] = useState(null)

  const handlePicker = (selectedDate) => {
    setDate(selectedDate)
    if (onCallbackPicker) {
      onCallbackPicker(selectedDate)
    }
    console.log(selectedDate)
  }

  return (
    <div className={`flex flex-col gap-2 ${mainClass}`}>
      <Label className={labelClass}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              `justify-start text-left font-normal`,
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handlePicker}
            fromDate={new Date(fromYear, 0, 1)}
            toDate={new Date(toYear, 11, 31)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default FormDatePicker


// "use client"

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
// import { format, addYears, subYears } from "date-fns";
// import React, { useState } from "react";

// const FormDatePicker = ({
//   onCallbackPicker,
//   mainClass,
//   labelClass,
//   label = "Date of Birth*",
//   fromYear = 1900,
//   toYear = new Date().getFullYear(),
//   error,
// }) => {
//   const [date, setDate] = useState(null);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   const handlePicker = (event) => {
//     setDate(event);
//     if (onCallbackPicker) {
//       onCallbackPicker(event);
//     }
//     console.log(event);
//   };

//   const goToPreviousYear = () => {
//     const prevYear = subYears(currentMonth, 1);
//     if (prevYear.getFullYear() >= fromYear) {
//       setCurrentMonth(prevYear);
//     }
//   };

//   const goToNextYear = () => {
//     const nextYear = addYears(currentMonth, 1);
//     if (nextYear.getFullYear() <= toYear) {
//       setCurrentMonth(nextYear);
//     }
//   };

//   return (
//     <div className={`flex flex-col gap-2 ${mainClass}`}>
//       <Label className={labelClass}>{label}</Label>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             variant={"outline"}
//             className={cn(
//               `justify-start text-left font-normal`,
//               !date && "text-muted-foreground"
//             )}>
//             <CalendarIcon className='mr-2' />
//             {date ? format(date, "PPP") : <span>Pick a date</span>}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className='w-auto p-0' align='start'>
//           <div className='flex items-center justify-between px-4 py-2'>
//             <Button
//               variant='ghost'
//               size='sm'
//               onClick={goToPreviousYear}
//               disabled={currentMonth.getFullYear() <= fromYear}>
//               <ChevronLeft className='w-4 h-4' />
//             </Button>
//             <span className='font-semibold'>{currentMonth.getFullYear()}</span>
//             <Button
//               variant='ghost'
//               size='sm'
//               onClick={goToNextYear}
//               disabled={currentMonth.getFullYear() >= toYear}>
//               <ChevronRight className='w-4 h-4' />
//             </Button>
//           </div>
//           <Calendar
//             mode='single'
//             selected={date}
//             onSelect={handlePicker}
//             fromDate={new Date(fromYear, 0, 1)}
//             toDate={new Date(toYear, 11, 31)}
//             month={currentMonth} 
//             onMonthChange={setCurrentMonth} 
//             initialFocus
//           />
//         </PopoverContent>
//       </Popover>
//       {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
//     </div>
//   );
// };

// export default FormDatePicker;
