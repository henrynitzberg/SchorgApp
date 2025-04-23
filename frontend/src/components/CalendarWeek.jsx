import { useEffect, useRef, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";

import "../css/CalendarWeek.css";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
const hourHeight = 4; // 4em
const pixelsPerHour = hourHeight * 16; // 1em = 16px

export default function CalendarWeek({
  startDate = new Date(),
  todos,
  deliverables,
}) {
  const [userTodos, setUserTodos] = useState([]);
  const [userDeliverables, setUserDeliverables] = useState([]);

  useEffect(() => {
    setUserTodos(todos);
  }, [todos]);

  useEffect(() => {
    setUserDeliverables(deliverables);
  }, [deliverables]);

  const weekStart = startOfWeek(startDate, { weekStartsOn: 7 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const scrollRef = useRef(null);

  // view calendar starting 4 hours before right now
  useEffect(() => {
    const targetHour = new Date().getHours() + new Date().getMinutes() / 60 - 4;
    const scrollOffset = pixelsPerHour * targetHour;

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollOffset;
    }
  }, []);

  return (
    <div className="calendar-week-wrapper">
      <div className="calendar-week-headers-wrapper">
        <div className="gap-for-hours"> </div>
        {days.map((day, i) => {
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <div
              className={
                isToday
                  ? "calendar-week-today-header"
                  : "calendar-week-day-header"
              }
              key={i}
            >
              <h1 className="number-date">{format(day, "MM/dd")}</h1>
              <h1 className="weekday">{format(day, "EEE")}</h1>
              <div className="dots-wrapper">
                {/* add deadlines */}
                {userDeliverables
                  .filter(
                    (event) =>
                      format(event.due_date, "yyyy-MM-dd") ===
                      format(day, "yyyy-MM-dd")
                  )
                  .slice(0, 4)
                  .map((event, index) => {
                    return (
                      (index < 3 && <div key={index} className="dot"></div>) ||
                      (index === 3 && (
                        <div key={index} className="header-ellipses">
                          ...
                        </div>
                      ))
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="calendar-week-day-bodys-wrapper" ref={scrollRef}>
        <div className="calendar-week-hours-wrapper">
          {hours.map((hour, index) => (
            <h1
              className="calendar-week-hour-label"
              style={{ height: `${pixelsPerHour}px` }}
              key={index}
            >
              {" "}
              {hour}:00{" "}
            </h1>
          ))}
        </div>
        {days.map((day, index) => (
          <div key={index} className="calendar-week-day-body">
            {hours.map((hour) => (
              <div
                key={hour}
                className="calendar-week-hour"
                style={{ height: `${pixelsPerHour}px` }}
              ></div>
            ))}

            {/* add current time line marker */}
            {format(day, "yyyy-MM-dd") == format(new Date(), "yyyy-MM-dd") && (
              <div
                className="current-time-line"
                style={{
                  top: `${
                    pixelsPerHour *
                    (new Date().getHours() + new Date().getMinutes() / 60)
                  }px`,
                }}
              ></div>
            )}

            {/* add events */}
            {userTodos
              .filter(
                (event) =>
                  format(event.start_time, "yyyy-MM-dd") ===
                  format(day, "yyyy-MM-dd")
              )
              .map((event, index) => {
                const startHour =
                  new Date(event.start_time).getHours() +
                  new Date(event.start_time).getMinutes() / 60;
                const endHour =
                  new Date(event.end_time).getHours() +
                  new Date(event.end_time).getMinutes() / 60;
                const top = startHour * pixelsPerHour;
                const height = (endHour - startHour) * pixelsPerHour;
                console.log(startHour, endHour);
                console.log(
                  new Date(event.start_time).getHours(),
                  new Date(event.end_time).getHours(),
                  new Date(event.start_time).getMinutes() / 60,
                  new Date(event.end_time).getMinutes() / 60
                );
                return (
                  <div
                    key={index}
                    className="calendar-event"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <h1 className="calendar-event-title"> {event.title} </h1>
                    <h1 className="calendar-event-time">
                      {format(event.start_time, "hh:mm")}-
                      {format(event.end_time, "hh:mm")}
                    </h1>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
