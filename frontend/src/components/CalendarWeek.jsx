import React from "react";
import { startOfWeek, addDays, format } from "date-fns";

import "../css/CalendarWeek.css";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

export default function CalendarWeek({ startDate = new Date() }) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 7 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="calendar-week-wrapper">
      <div className ="calendar-week-header-wrapper">
        <div className="calendar-week-header">
          {days.map((day) => (
            <div key={day} className="day-header-wrapper">
              <h1 className="number-date">{format(day, "dd")}</h1>
              <h1 className="weekday">{format(day, "EEE")}</h1>
            </div>
          ))}
          </div>
      </div>
      <div className="calendar-week-body">
        <div className="calendar-week-hours">
        {hours.map((hour) => (
          <div key={hour} className="calendar-week-hour-wrapper">
            <div className="calendar-week-hour">{`${hour}:00`}</div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
