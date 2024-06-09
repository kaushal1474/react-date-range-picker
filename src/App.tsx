import DateRangePicker from "./DateRangePicker";
import "./App.css"
import { useState } from "react";

function App() {

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleDateChange = (
    selectedRange: { startDate: Date | null; endDate: Date | null },
    weekends: Date[]
  ) => {

    setStartDate(selectedRange.startDate);
    setEndDate(selectedRange.endDate);
    console.log("Selected Range:", selectedRange);
    console.log("Weekends in Range:", weekends);
  };

  function clearSelectedRange() {
    console.log("clear data");
    
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <div>
      <h3>React Date Range Picker</h3>
      <DateRangePicker
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        clearSelectedRange={clearSelectedRange}
      />
    </div>
  )
}

export default App
