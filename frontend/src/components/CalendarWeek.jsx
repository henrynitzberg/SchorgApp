import React from "react";
import { startOfWeek, addDays, format } from "date-fns";

import "../css/CalendarWeek.css";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

export default function CalendarWeek({ startDate = new Date() }) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 7 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="calendar-week-wrapper">
      <div className="calendar-times-wrapper">
        {hours.map((hour) => (
          <p key={hour} className="time-slot">
            {format(new Date().setHours(hour, 0), "HH:mm")}
          </p>
        ))}
      </div>
      <div className="calendar-body-wrapper">
        <div className="calendar-week-header">
          {/* <div className="time-column" /> */}
          {days.map((day) => (
            <div key={day} className="day-header-wrapper">
              <h1 className="weekday">{format(day, "EEE")}</h1>
              <h1 className="number-date">{format(day, "dd")}</h1>
            </div>
          ))}
        </div>
        <div className="calendar-body">
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
          <div className="grid-lines"></div>
        </div>
      </div>
    </div>
  );
}
