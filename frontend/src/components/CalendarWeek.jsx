import { useEffect, useRef, useState } from "react";
import { startOfWeek, addDays, format, set } from "date-fns";
import ToDoForm from "./toDoForm.jsx";
import {
  updateUserDeliverables,
  updateTodos,
  removeTodos,
  editTodo,
} from "../crud.js";

import "../css/CalendarWeek.css";
import NewDeliverableForm from "./NewDeliverableForm";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
const hourHeight = 4; // 4em
const pixelsPerHour = hourHeight * 16; // 1em = 16px

export default function CalendarWeek({
  user,
  startDate = new Date(),
  userTodos,
  setUserTodos,
  userDeliverables,
  setUserDeliverables,
  userSpaces,
  setUserSpaces,
}) {
  const [popupShowing, setPopupShowing] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);

  const [showDeliverablePopup, setShowDeliverablePopup] = useState(false);
  const [showTodoPopup, setShowTodoPopup] = useState(false);
  const [showEditTodoPopup, setShowEditTodoPopup] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null); // For assigning event to day
  const [selectedToDo, setSelectedToDo] = useState(null); // For editing todo

  const [initialStartTime, setInitialStartTime] = useState("00:00"); // optional
  const initialDuration = 1; // in hours
  const [initialEndTime, setInitialEndTime] = useState("00:00"); // optional

  const handleSaveNewDeliverable = async (newEventData) => {
    const [dueMonth, dueDay, dueYear] = newEventData.dueDate.split("/");
    const [dueHour, dueMinute] = newEventData.dueTime.split(":");

    const due_date = new Date(
      dueYear,
      dueMonth - 1,
      dueDay,
      dueHour,
      dueMinute
    );

    const deliverable = {
      title: newEventData.title,
      description: newEventData.description,
      due_date: due_date,
      time_worked: 0,
      space: null,
      space_deliverable: null,
    };

    try {
      const newDeliverablesWithId = await updateUserDeliverables(user.email, [
        deliverable,
      ]);

      setUserDeliverables((prev) => [...prev, ...newDeliverablesWithId]);
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeFrame = (todoEventData) => {
    // Convert to full datetime using selectedDay
    const [startHour, startMinute] = todoEventData.startTime.split(":");
    const [endHour, endMinute] = todoEventData.endTime.split(":");

    const start_time = new Date(selectedDay);
    start_time.setHours(startHour, startMinute);

    const end_time = new Date(selectedDay);
    end_time.setHours(endHour, endMinute);

    return { start_time, end_time };
  };

  const handleSaveNewToDo = async (newEventData) => {
    const time_frame = getTimeFrame(newEventData);
    const start_time = time_frame.start_time;
    const end_time = time_frame.end_time;

    const todo = {
      title: newEventData.title,
      description: newEventData.description,
      start_date: start_time,
      end_date: end_time,
      start_time: start_time,
      end_time: end_time,
      deliverable: newEventData.deliverable ? newEventData.deliverable._id : null,
      space: null,
    };

    console.log("Saving new todo: ", todo);
    try {
      const newTodosWithId = await updateTodos(user.email, [todo]);
      setUserTodos((prev) => [...prev, ...newTodosWithId]);
      console.log(userTodos);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditToDo = (eventData, id) => {
    const time_frame = getTimeFrame(eventData);
    const start_time = time_frame.start_time;
    const end_time = time_frame.end_time;

    const todo_edit = {
      title: eventData.title,
      description: eventData.description,
      start_time,
      end_time,
      deliverable: eventData.deliverable._id,
      space: null,
      _id: id,
    };

    console.log("saving edited todo: ", todo_edit);

    editTodo(user.email, todo_edit);
    setUserTodos((prev) =>
      prev.map((todo) => {
        if (todo._id === id) {
          return {
            ...todo,
            title: eventData.title,
            description: eventData.description,
            start_time,
            end_time,
            deliverable: eventData.deliverable._id,
          };
        }
        return todo;
      })
    );
  };

  const handleRemoveToDo = (e) => {
    console.log("removing todo: ", e);
    const id = e._id;
    removeTodos(user.email, [id]);
    setUserTodos((prev) => prev.filter((todo) => todo._id !== id));
  };

  const [weekStart, setWeekStart] = useState(startOfWeek(startDate, { weekStartsOn: 7 })); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const scrollRef = useRef(null);

  // view calendar starting ~4 hours before right now
  useEffect(() => {
    const targetHour = new Date().getHours() + new Date().getMinutes() / 60 - 4;
    const scrollOffset = pixelsPerHour * targetHour;

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollOffset;
    }
  }, []);

  return (
    <div
      className="calendar-week-wrapper"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* block ability to open other calendar related popups while one is already showing */}
      <div className={popupShowing ? "popup-showing" : "popup-hidden"}></div>

      {showDeliverablePopup && (
        <NewDeliverableForm
          position={popupPosition}
          initialDueDay={selectedDay}
          onSave={handleSaveNewDeliverable}
          onClose={() => {
            setPopupShowing(false);
            setShowDeliverablePopup(false);
          }}
        />
      )}

      {showTodoPopup && (
        <ToDoForm
          position={popupPosition}
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          deliverables={userDeliverables}
          onSave={handleSaveNewToDo}
          onClose={() => {
            setPopupShowing(false);
            setShowTodoPopup(false);
          }}
          editMode={false}
        />
      )}

      {showEditTodoPopup && (
        <ToDoForm
          position={popupPosition}
          initialStartTime={"00:00"}
          initialEndTime={"00:00"}
          deliverables={userDeliverables}
          onClose={() => {
            setShowEditTodoPopup(false);
            setPopupShowing(false);
          }}
          onSave={null}
          onEdit={handleEditToDo}
          editMode={true}
          eventData={selectedToDo}
          handleRemoveTodo={handleRemoveToDo}
        />
      )}
      <div className="calendar-week-header-wrapper">
        <button className="switch-week-button-left" onClick={() => {
          setWeekStart(startOfWeek(addDays(weekStart, -7), { weekStartsOn: 7 }));
        }}>
          <div className="arrow-left">
            <img src="/last-month.svg" />
          </div>
        </button>
        <div className="calendar-week-headers-wrapper">
          {days.map((day, index) => {
            const isToday =
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <button
                className={
                  isToday
                    ? "calendar-week-today-header"
                    : "calendar-week-day-header"
                }
                key={index}
                onClick={(e) => {
                  if (showDeliverablePopup) {
                    return;
                  }

                  const x = e.clientX;
                  const y = e.clientY;
                  setPopupPosition({ x, y });
                  setSelectedDay(day);
                  setShowDeliverablePopup(true);
                  setPopupShowing(true);
                }}
              >
                <h1 className="number-date">{format(day, "MM/dd")}</h1>
                <h1 className="weekday">{format(day, "EEE")}</h1>
                <div className="dots-wrapper">
                  {/* add deadlines */}
                  {userDeliverables
                    .filter((todo) => {
                      const matchingSpace = userSpaces.find(
                        (space) => space._id === todo.space
                      );
                      return matchingSpace ? matchingSpace.shown !== false : true;
                    })
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
              </button>
            );
          })}
        </div>
        <button className="switch-week-button-right" onClick={() => { 
          setWeekStart(startOfWeek(addDays(weekStart, 7), { weekStartsOn: 7 }));
        }}>
          <div className="arrow-right">
            {/* right arrow image */}
            <img src="/next-month.svg" alt="right arrow" />
          </div>
        </button>
      </div>

      <div className="calendar-week-body-wrapper" ref={scrollRef}>
        <div className="calendar-week-hours-wrapper">
          {hours.map((hour, index) => (
            <h1
              key={index}
              className="calendar-week-hour-label"
              style={{ height: `${pixelsPerHour}px` }}
            >
              {" "}
              {hour}:00{" "}
            </h1>
          ))}
        </div>
        <div className="calendar-week-day-bodys-wrapper">
          {days.map((day, index) => (
            <button
              key={index}
              className="calendar-week-day-body"
              onClick={(e) => {
                if (showTodoPopup) {
                  return;
                }

                const x = e.clientX;
                const y = e.clientY;
                setPopupPosition({ x, y });
                setSelectedDay(day);

                const rect = e.currentTarget.getBoundingClientRect();
                const clickedHour = (y - rect.top) / pixelsPerHour;
                const hour = Math.floor(clickedHour);
                // round to nearest 15 minutes
                let minutes =
                  Math.round(Math.round((clickedHour - hour) * 60) / 15) * 15;
                
                if (minutes === 60) {
                  minutes = 45;
                }
                const formattedStartTime = `${hour
                  .toString()
                  .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                setInitialStartTime(formattedStartTime);
                if (24 - clickedHour < initialDuration) {
                  setInitialEndTime("23:59");
                } else {
                  const formattedEndTime = `${(hour + initialDuration)
                    .toString()
                    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                  setInitialEndTime(formattedEndTime);
                }

                setShowTodoPopup(true);
                setPopupShowing(true);
              }}
            >
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
                .filter((todo) => {
                  const matchingDeliverable = userDeliverables.find(
                    (deliverable) => deliverable._id === todo.deliverable
                  );

                  if (!matchingDeliverable) return true;

                  const matchingSpace = userSpaces.find(
                    (space) => space._id === matchingDeliverable.space
                  );

                  return matchingSpace ? matchingSpace.shown !== false : true;
                })
                .filter(
                  (event) =>
                    format(event.start_date, "yyyy-MM-dd") ===
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
                  return (
                    <div
                      key={index}
                      className="calendar-event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                      onContextMenu={(e) => {
                        if (showEditTodoPopup) {
                          return;
                        }
                        setSelectedToDo(event);
                        const x = e.clientX;
                        const y = e.clientY;
                        setPopupPosition({ x, y });
                        setShowEditTodoPopup(true);
                        setSelectedDay(day);
                        setPopupShowing(true);
                      }}
                    >
                      <h1 className="calendar-event-title"> {event.title} </h1>
                      <h1 className="calendar-event-time">
                        {format(event.start_time, "HH:mm")}-
                        {format(event.end_time, "HH:mm")}
                      </h1>
                    </div>
                  );
                })}
              
              {/* add any preview */}
              {showTodoPopup && (format(day, "yyyy-MM-dd") == format(selectedDay, "yyyy-MM-dd")) && (
                  <div
                    className="calendar-event-preview"
                    style={{
                      top: `${(parseInt(initialStartTime.split(":")[0]) + (parseInt(initialStartTime.split(":")[1]) / 60)) * pixelsPerHour}px`,
                      height: `${(initialDuration) * pixelsPerHour}px`,
                    }}
                  >
                  </div>
              )}

            </button>
          ))}
        </div>
        <div className="calendar-week-hours-wrapper-right"></div>
      </div>
    </div>
  );
}
