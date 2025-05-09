import { useState, useEffect } from "react";

import "../css/DatePickerPopUp.css";

export default function DatePickerPopUp({ value, onChange = () => {} }) {
  const [view, setView] = useState("date");
  const [selectedDate, setSelectedDate] = useState(value);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date()
  );
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const firstWeekday = firstDayOfMonth.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const currDays = [];

    for (let i = 0; i < firstWeekday; i++) {
      currDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === i;

      const newDate = new Date(year, month, i);

      currDays.push(
        <button
          key={i}
          className={`calendar-day${isSelected ? "-selected" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setSelectedDate(newDate);
            onChange(newDate);
          }}
        >
          {i}
        </button>
      );
    }

    setDays(currDays);
  }, [currentMonth, selectedDate]);

  return (
    <div className="date-picker-pop-up-wrapper">
      <div className="option-wrapper">
        <button
          className={
            view === "date" ? "option-buttons-selected" : "option-buttons"
          }
          onClick={(e) => {
            e.preventDefault();
            setView("date");
          }}
        >
          Date
        </button>
        <button
          className={
            view === "time" ? "option-buttons-selected" : "option-buttons"
          }
          onClick={(e) => {
            e.preventDefault();
            setView("time");
          }}
        >
          Time
        </button>
      </div>
      {view === "date" ? (
        <div className="calendar-view-wrapper">
          <div className="calendar-navigation-wrapper">
            <button
              className="calendar-navigation-buttons"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                );
              }}
            >
              <img
                src="/last-month.svg"
                alt="Last month"
                className="calendar-navigation-button-icon"
              />
            </button>
            <button className="calendar-navigation-month">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </button>
            <button
              className="calendar-navigation-buttons"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                );
              }}
            >
              <img
                src="/next-month.svg"
                alt="Next month"
                className="calendar-navigation-button-icon"
              />
            </button>
          </div>
          <div className="calendar-body-wrapper">
            <div className="calendar-body-weekdays-wrapper">
              <p className="calendar-body-weekday">Sun</p>
              <p className="calendar-body-weekday">Mon</p>
              <p className="calendar-body-weekday">Tue</p>
              <p className="calendar-body-weekday">Wed</p>
              <p className="calendar-body-weekday">Thu</p>
              <p className="calendar-body-weekday">Fri</p>
              <p className="calendar-body-weekday">Sat</p>
            </div>
            {/* {console.log("selected date:", selectedDate)} */}
            <div className="calendar-body-dates-wrapper">{days}</div>
          </div>
        </div>
      ) : (
        <div className="time-view-wrapper">
          <div className="time-view-selectors">
            <div className="time-view-headers-wrapper">
              <h1 className="time-view-hours-selector-header">Hours</h1>
              <h1 className="time-view-min-selector-header">Mins</h1>
            </div>
            <div className="time-view-selectors-wrapper">
              <div className="time-view-hours-selector">
                {Array.from({ length: 12 }, (_, i) => {
                  const num = i + 1;
                  const label = num.toString().padStart(2, "0");
                  return (
                    <button
                      key={label}
                      className="time-view-hours"
                      onClick={() => setHour(num)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="time-view-min-selector">
                {Array.from({ length: 60 }, (_, i) => {
                  const label = i.toString().padStart(2, "0");
                  return (
                    <button
                      key={label}
                      className="time-view-mins"
                      onClick={() => setMinute(i)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="time-view-am-pm-wrapper">
            <button className="time-view-am-pm-buttons-am">AM</button>
            <button className="time-view-am-pm-buttons-pm">PM</button>
          </div>
        </div>
      )}
    </div>
  );
}
