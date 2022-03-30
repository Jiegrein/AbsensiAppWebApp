// in src/App.js
import Services from './services/AdminServices';
import Indo from 'date-fns/locale/id';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  registerLocale('id', Indo);

  const handleDownloadClick = async () => {
    Services.getExcelFromDates(startDate, endDate);
  };

  return (
    <div>
      <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} />
      <DatePicker selected={endDate} onChange={(date: Date) => setEndDate(date)} />

      <button onClick={handleDownloadClick}>
        Download Gaji
      </button>
    </div>
  );
}