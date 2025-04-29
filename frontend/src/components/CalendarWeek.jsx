import { useEffect, useRef, useState } from "react";
import { startOfWeek, addDays, format, set } from "date-fns";
import { ObjectId } from "bson";
import ToDoForm from "./toDoForm.jsx";
import { updateUserDeliverables, updateTodos, removeTodos, editTodo } from "../crud.js";

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
  const [showToDoPopup, setShowToDoPopup] = useState(false);
  const [showEditToDoPopup, setShowEditToDoPopup] = useState(false);
  const [showDeliverablePopup, setShowDeliverablePopup] = useState(false);
  const [clickedOutOfToDoPopup, setClickedOutOfToDoPopup] = useState(false);
  const [clickedOutOfEditToDoPopup, setClickedOutOfEditToDoPopup] =
    useState(false);
  const [clickedOutOfDeliverablePopup, setClickedOutOfDeliverablePopup] =
    useState(false);
  const [toDoPopupPosition, setToDoPopupPosition] = useState({ x: 0, y: 0 });
  const [deliverablePopupPosition, setDeliverablePopupPosition] = useState({
    x: 0,
    y: 0,
  });
  const [eventPopupDay, setEventPopupDay] = useState(-1);
  const [selectedToDo, setSelectedToDo] = useState(null); // For editing todo

  const [selectedDay, setSelectedDay] = useState(null); // For assigning event to day
  const [initialStartTime, setInitialStartTime] = useState("00:00"); // optional
  const initialDuration = 1; // in hours
  const [initialEndTime, setInitialEndTime] = useState("00:00"); // optional

  const handleSaveNewDeliverable = (newEventData) => {
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
      _id: new ObjectId(),
    };

    updateUserDeliverables(user.email, [deliverable]);

    setUserDeliverables((prev) => [...prev, deliverable]);
  };

  const handleSaveNewToDo = (newEventData) => {
    // Convert to full datetime using selectedDay
    const [startHour, startMinute] = newEventData.startTime.split(":");
    const [endHour, endMinute] = newEventData.endTime.split(":");

    const start_time = new Date(selectedDay);
    start_time.setHours(startHour, startMinute);

    const end_time = new Date(selectedDay);
    end_time.setHours(endHour, endMinute);

    const todo = {
      title: newEventData.title,
      description: newEventData.description,
      start_time,
      end_time,
      deliverable: newEventData.deliverable,
      space: null,
      _id: new ObjectId(),
    };

    updateTodos(user.email, [todo]);

    setUserTodos((prev) => [...prev, todo]);
  };

  const handleEditToDo = (eventData, id) => {
    const [startHour, startMinute] = eventData.startTime.split(":");
    const [endHour, endMinute] = eventData.endTime.split(":");

    const start_time = new Date(selectedDay);
    start_time.setHours(startHour, startMinute);

    const end_time = new Date(selectedDay);
    end_time.setHours(endHour, endMinute);

    const todo_edit = {
      title: eventData.title,
      description: eventData.description,
      start_time,
      end_time,
      deliverable: eventData.deliverable,
      space: null,
      _id: id,
    };

    console.log("new version of old todo: ", todo_edit);

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
            deliverable: eventData.deliverable,
          };
        }
        return todo;
      })
    );
  };

  const handleRemoveToDo = (e) => {
    const eventData = e;
    removeTodos(user.email, [eventData]);
    setUserTodos((prev) => prev.filter((todo) => todo._id !== eventData._id));
  };

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
        {days.map((day, index) => {
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <div
              className={
                isToday
                  ? "calendar-week-today-header"
                  : "calendar-week-day-header"
              }
              key={index}
              onClick={(e) => {
                if (showDeliverablePopup || clickedOutOfDeliverablePopup) {
                  setClickedOutOfDeliverablePopup(false);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                setEventPopupDay(index);
                setDeliverablePopupPosition({ x, y });
                setShowDeliverablePopup(true);
                setSelectedDay(day);
              }}
            >
              {showDeliverablePopup && eventPopupDay == index && (
                <NewDeliverableForm
                  position={deliverablePopupPosition}
                  initialDueDay={day}
                  onSubmit={handleSaveNewDeliverable}
                  onClose={() => {
                    setShowDeliverablePopup(false);
                    setClickedOutOfDeliverablePopup(true);
                  }}
                />
              )}
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
            </div>
          );
        })}
      </div>
      <div className="calendar-week-day-bodys-wrapper" ref={scrollRef}>
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
        {days.map((day, index) => (
          <div
            key={index}
            className="calendar-week-day-body"
            onClick={(e) => {
              if (
                showToDoPopup ||
                clickedOutOfToDoPopup ||
                showEditToDoPopup ||
                clickedOutOfEditToDoPopup
              ) {
                setClickedOutOfToDoPopup(false);
                setClickedOutOfEditToDoPopup(false);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setEventPopupDay(index);
              setToDoPopupPosition({ x, y });
              setShowToDoPopup(true);

              const clickedHour = y / pixelsPerHour;
              const hour = Math.floor(clickedHour);
              // floor to nearest 15 minutes
              const minutes =
                Math.floor(Math.floor((clickedHour - hour) * 60) / 15) * 15;
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
              setSelectedDay(day);
            }}
          >
            {showToDoPopup && eventPopupDay == index && (
              <ToDoForm
                position={toDoPopupPosition}
                initialStartTime={initialStartTime}
                initialEndTime={initialEndTime}
                deliverables={userDeliverables}
                onClose={() => {
                  setShowToDoPopup(false);
                  setClickedOutOfToDoPopup(true);
                }}
                onSave={handleSaveNewToDo}
                editMode={false}
              />
            )}

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
                const matchingSpace = userSpaces.find(
                  (space) => space._id === todo.space
                );
                return matchingSpace ? matchingSpace.shown !== false : true;
              })
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
                return (
                  <div
                    key={index}
                    className="calendar-event"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                    onContextMenu={(e) => {
                      if (
                        showToDoPopup ||
                        clickedOutOfToDoPopup ||
                        showEditToDoPopup ||
                        clickedOutOfEditToDoPopup
                      ) {
                        setClickedOutOfToDoPopup(false);
                        setClickedOutOfEditToDoPopup(false);
                        return;
                      }
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      setSelectedToDo(event._id);
                      setToDoPopupPosition({ x, y });
                      setShowEditToDoPopup(true);
                      setSelectedDay(day);
                    }}
                  >
                    <h1 className="calendar-event-title"> {event.title} </h1>
                    <h1 className="calendar-event-time">
                      {format(event.start_time, "hh:mm")}-
                      {format(event.end_time, "hh:mm")}
                    </h1>

                    {/* {showEditToDoPopup && ( */}
                    {showEditToDoPopup && selectedToDo === event._id && (
                      <ToDoForm
                        position={toDoPopupPosition}
                        initialStartTime={""}
                        initialEndTime={""}
                        deliverables={userDeliverables}
                        onClose={() => {
                          setShowEditToDoPopup(false);
                          setClickedOutOfEditToDoPopup(true);
                        }}
                        onSave={null}
                        onEdit={handleEditToDo}
                        editMode={true}
                        eventData={event}
                        handleRemoveTodo={handleRemoveToDo}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
