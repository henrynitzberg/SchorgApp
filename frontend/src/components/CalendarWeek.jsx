import React, { useEffect, useRef } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';

import '../css/CalendarWeek.css';

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
const hourHeight = 4; // 4em
const pixelsPerHour = hourHeight * 16; // 1em = 16px

const sampleTodos = [
  {
    id: 1,
    title: 'figure out time to meet with Henry',
    start: new Date('2025-04-20T09:30:00'),
    end: new Date('2025-04-20T10:15:00'),
    description: 'Note: do NOT poop my pants this time',
  },
];

const sampleDeliverables = [
  {
    id: 1,
    title: 'big important project',
    due_date: new Date('2025-04-24T23:59:00'),
    description: 'my life depends on this',
  },
  {
    id: 2,
    title: 'big important project2',
    due_date: new Date('2025-04-24T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 3,
    title: 'big important project2',
    due_date: new Date('2025-04-24T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-24T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 3,
    title: 'big important project2',
    due_date: new Date('2025-04-22T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-22T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-23T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-25T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-25T23:59:00'),
    description: 'my life depends on this2',
  },
  {
    id: 4,
    title: 'big important project2',
    due_date: new Date('2025-04-25T23:59:00'),
    description: 'my life depends on this2',
  },
];

export default function CalendarWeek({ startDate = new Date() }) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 7 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const scrollRef = useRef(null);

  useEffect(() => {
    const targetHour = 7.75;
    const scrollOffset = pixelsPerHour * targetHour;

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollOffset;
    }
  }, []);

  return (
    <div className="calendar-week-wrapper">
      <div className="calendar-week-headers-wrapper">
        {days.map((day) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div className={isToday ? 'calendar-week-today-header' : 'calendar-week-day-header'}>
              <h1 className="number-date">{format(day, 'MM/dd')}</h1>
              <h1 className="weekday">{format(day, 'EEE')}</h1>
              <div className="dots-wrapper">
                {/* add deadlines */}
                {sampleDeliverables
                      .filter(
                        (event) =>
                          format(event.due_date, 'yyyy-MM-dd') ===
                          format(day, 'yyyy-MM-dd')
                      ).slice(0, 4)
                  .map((event, index) => {
                    return (
                      index < 3 && (
                        <div key={event.id} className="dot"></div>
                        ) || (
                      index === 3 && (
                        <div className="header-ellipses">...</div>
                      )
                    ))
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="calendar-week-day-bodys-wrapper" ref={scrollRef}>
        {days.map((day, index) => (
          <div className="calendar-week-day-body">
            {hours.map((hour) => (
              <div
                key={hour}
                className="calendar-week-hour"
                style={{ height: `${pixelsPerHour}px` }}
              >
                {index === 0 && (
                  <h1 className="calendar-week-hour-label"> {hour}:00 </h1>
                )}
              </div>
            ))}

            {/* add current time line marker */}
            {format(day, 'yyyy-MM-dd') == format(new Date(), 'yyyy-MM-dd') && (
              <div
                className="current-time-line"
                style={{
                  top: `${pixelsPerHour * (new Date().getHours() + (new Date().getMinutes() / 60))}px`,
                }}
              ></div>
            )}

            {/* add events */}
            {sampleTodos
              .filter(
                (event) =>
                  format(event.start, 'yyyy-MM-dd') ===
                  format(day, 'yyyy-MM-dd')
              )
              .map((event) => {
                const startHour =
                  event.start.getHours() + event.start.getMinutes() / 60;
                const endHour =
                  event.end.getHours() + event.end.getMinutes() / 60;
                const top = startHour * pixelsPerHour;
                const height = (endHour - startHour) * pixelsPerHour;
                return (
                  <div
                    key={event.id}
                    className="calendar-event"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <h1 className="calendar-event-title"> {event.title} </h1>
                    <h1 className="calendar-event-time">
                      {format(event.start, 'hh:mm')}-
                      {format(event.end, 'hh:mm')}
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
