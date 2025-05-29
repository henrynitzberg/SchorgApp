import { useEffect, useRef, useState } from "react";
import { startOfWeek, addDays, format, set } from "date-fns";
import ToDoForm from "./toDoForm.jsx";
import {
  writeTodo,
  removeTodo,
  editTodo,
  writeUserDeliverable,
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
  const noImage = new Image();
  noImage.src = "/no-image.svg";

  const [showCalendarEventPreview, setShowCalendarEventPreview] =
    useState(false);

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
      minutes_worked: 0,
      space: null,
      space_deliverable: null,
    };

    try {
      const newDeliverableWithId = await writeUserDeliverable(
        user.email,
        deliverable
      );

      setUserDeliverables((prev) => [...prev, newDeliverableWithId]);
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
      dates: { start: start_time, end: end_time },
      times: { start: start_time, end: end_time },
      deliverable: newEventData.deliverable
        ? newEventData.deliverable._id
        : null,
      space: null,
    };

    console.log("Saving new todo: ", todo);
    try {
      const newTodoWithId = await writeTodo(user.email, todo);
      setUserTodos((prev) => [...prev, newTodoWithId]);
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
      dates: { start: start_time, end: end_time },
      times: { start: start_time, end: end_time },
      deliverable: eventData.deliverable ? eventData.deliverable._id : null,
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
            dates: { start: start_time, end: end_time },
            times: { start: start_time, end: end_time },
            deliverable: eventData.deliverable
              ? eventData.deliverable._id
              : null,
          };
        }
        return todo;
      })
    );
  };

  const handleRemoveToDo = (e) => {
    console.log("removing todo: ", e);
    const id = e._id;
    removeTodo(user.email, id);
    setUserTodos((prev) => prev.filter((todo) => todo._id !== id));
  };

  const handleTodoDrop = (e, day) => {
    const todo = selectedToDo;

    // get hour and minutes from drop position
    const x = e.clientX;
    const y = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedHour = (y - rect.top) / pixelsPerHour;
    const hour = Math.floor(clickedHour);
    // round to nearest 15 minutes
    let minutes = Math.round(Math.round((clickedHour - hour) * 60) / 15) * 15;

    if (minutes === 60) {
      minutes = 45;
    }
    const newStartTime = set(day, {
      hours: hour,
      minutes: minutes,
    });
    const startTime = new Date(todo.times.start);
    const endTime = new Date(todo.times.end);
    const todoDuration = endTime.getTime() - startTime.getTime();

    const newEndTime = new Date(newStartTime.getTime() + todoDuration);

    const editedTodo = {
      ...todo,
      dates: { start: newStartTime, end: newEndTime },
      times: { start: newStartTime, end: newEndTime },
    };

    console.log("editing todo after drop: ", editedTodo);

    const id = editedTodo._id;

    editTodo(user.email, editedTodo);
    setUserTodos((prev) =>
      prev.map((todo) => {
        if (todo._id === id) {
          return {
            ...todo,
            dates: { start: newStartTime, end: newEndTime },
            times: { start: newStartTime, end: newEndTime },
          };
        }
        return todo;
      })
    );
  };

  const generatePopupPosition = (e, popup_width, popup_height) => {
    const popupPadding = 10;

    let y = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    let popup_left = rect.x + rect.width - popupPadding;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (popup_left + popup_width > windowWidth) {
      popup_left = rect.x - popup_width + popupPadding;
    }
    if (y + popup_height > windowHeight + popupPadding) {
      y = windowHeight - popup_height - popupPadding;
    }

    return { x: popup_left, y: y };
  };

  const [groupedTodos, setGroupedTodos] = useState([]);

  const todosIntersect = (todo1, todo2) => {
    const start1 = new Date(todo1.times.start);
    const end1 = new Date(todo1.times.end);
    const start2 = new Date(todo2.times.start);
    const end2 = new Date(todo2.times.end);
    return (
      (start1 < start2 && start2 < end1) || (start2 < start1 && start1 < end2)
    );
  };

  const noneIntersect = (group, todo) => {
    for (let i = 0; i < group.length; i++) {
      if (todosIntersect(group[i], todo)) {
        return false;
      }
    }
    return true;
  };

  // sort group of intersecting todos for optimal layout
  const sortGroupForOptimalLayout = (group) => {
    let layers = [[group[0]]];
    for (let i = 1; i < group.length; i++) {
      for (let j = 0; j < layers.length; j++) {
        if (noneIntersect(layers[j], group[i])) {
          layers[j].push(group[i]);
          break;
        } else if (j === layers.length - 1) {
          layers.push([group[i]]);
          break;
        }
      }
    }
    // TODO: decide how to sort
    layers.sort((a, b) => {
      return new Date(a[0].times.start) - new Date(b[0].times.start);
    });

    return layers;
  };

  const groupOverlappingTodos = (todos) => {
    const sortedByStart = todos
      .filter((todo) => {
        // filter out todos that shouldn't be displayed
        return todo.times && todo.times.start && todo.times.end;
      })
      .sort((a, b) => {
        return new Date(a.times.start) - new Date(b.times.start);
      });

    const groupedTodos = [];
    let currentGroup = [];
    let currentLatestEnd = null;

    for (let i = 0; i < sortedByStart.length; i++) {
      const currentTodo = sortedByStart[i];
      const currentStart = new Date(currentTodo.times.start);
      const currentEnd = new Date(currentTodo.times.end);

      if (currentGroup.length === 0) {
        // if group is empty, start new group
        currentGroup.push(currentTodo);
        currentLatestEnd = currentEnd;
      } else {
        // check if any todo in current group overlaps with current todo
        if (currentStart < currentLatestEnd) {
          currentGroup.push(currentTodo);
          if (currentEnd > currentLatestEnd) {
            currentLatestEnd = currentEnd;
          }
        } else {
          // if no overlap, push current group and start new group
          groupedTodos.push(currentGroup);
          currentGroup = [currentTodo];
          currentLatestEnd = currentEnd;
        }
      }
    }
    // push the last group if it exists
    if (currentGroup.length > 0) {
      groupedTodos.push(currentGroup);
    }

    // within groupedTodos, sort each for optimal layout
    const groupedForLayout = groupedTodos.map((group) => {
      const sortedGroup = sortGroupForOptimalLayout(group);
      return sortedGroup;
    });
    console.log("Grouped Todos: ", groupedForLayout);
    return groupedForLayout;
  };

  useEffect(() => {
    const grouped = groupOverlappingTodos(userTodos);
    setGroupedTodos(grouped);
  }, [userTodos]);

  const [weekStart, setWeekStart] = useState(
    startOfWeek(startDate, { weekStartsOn: 7 })
  ); // Sunday
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
        <button
          className="switch-week-button-left"
          onClick={() => {
            setWeekStart(
              startOfWeek(addDays(weekStart, -7), { weekStartsOn: 7 })
            );
          }}
        >
          <div className="arrow-left">
            <img src="/last-month.svg" draggable="false" />
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

                  const position = generatePopupPosition(e, 225, 200);
                  setPopupPosition(position);
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
                      return matchingSpace
                        ? matchingSpace.shown !== false
                        : true;
                    })
                    .filter(
                      (event) =>
                        format(event.due_date, "yyyy-MM-dd") ===
                        format(day, "yyyy-MM-dd")
                    )
                    .slice(0, 4)
                    .map((event, index) => {
                      return (
                        (index < 3 && (
                          <div key={index} className="dot"></div>
                        )) ||
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
        <button
          className="switch-week-button-right"
          onClick={() => {
            setWeekStart(
              startOfWeek(addDays(weekStart, 7), { weekStartsOn: 7 })
            );
          }}
        >
          <div className="arrow-right">
            {/* right arrow image */}
            <img src="/next-month.svg" draggable="false" />
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

                // TODO: in all places where popup location is set, the width
                // of the popup (200, here) is hardcoded. Don't do this. Also...
                // the 300 for height is totally arbitrary.
                const position = generatePopupPosition(e, 200, 300);
                setPopupPosition(position);
                setSelectedDay(day);

                const y = e.clientY;
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
              onDragOver={(e) => {
                setShowCalendarEventPreview(true);

                const y = e.clientY;

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
                setSelectedDay(day);
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                setShowCalendarEventPreview(false);
                handleTodoDrop(e, day);
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
              {format(day, "yyyy-MM-dd") ==
                format(new Date(), "yyyy-MM-dd") && (
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
              {groupedTodos
                .filter((todoDisplayGroup) => {
                  return (
                    format(todoDisplayGroup[0][0].times.start, "yyyy-MM-dd") ===
                    format(day, "yyyy-MM-dd")
                  );
                })
                .map((todoDisplayGroup) => {
                  return todoDisplayGroup.map((eventGroup, groupIndex) => {
                    return eventGroup.map((event, index) => {
                      const currGroupSize = todoDisplayGroup.length;

                      const startHour =
                        new Date(event.times.start).getHours() +
                        new Date(event.times.start).getMinutes() / 60;
                      const endHour =
                        new Date(event.times.end).getHours() +
                        new Date(event.times.end).getMinutes() / 60;
                      const top = startHour * pixelsPerHour;
                      const height = (endHour - startHour) * pixelsPerHour;
                      const width = 100 / currGroupSize; // percentage width based on group size
                      const left = (100 / currGroupSize) * groupIndex; // left offset based on index in group
                      return (
                        <div
                          key={index}
                          className="calendar-event"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            width: `${width}%`,
                            left: `${left}%`,
                          }}
                          onContextMenu={(e) => {
                            if (showEditTodoPopup) {
                              return;
                            }
                            setSelectedToDo(event);

                            const position = generatePopupPosition(e, 200, 300);
                            setPopupPosition(position);
                            setShowEditTodoPopup(true);
                            setSelectedDay(day);
                            setPopupShowing(true);
                          }}
                          draggable={true}
                          onDragStart={(e) => {
                            setSelectedToDo(event);

                            // hides default drag image
                            e.dataTransfer.setDragImage(noImage, 0, 0);
                          }}
                          onDragEnd={(e) => {
                            setShowCalendarEventPreview(false);
                            e.preventDefault();
                          }}
                        >
                          <h1 className="calendar-event-title">
                            {" "}
                            {event.title}{" "}
                          </h1>
                          <h1 className="calendar-event-time">
                            {format(event.times.start, "HH:mm")}-
                            {format(event.times.end, "HH:mm")}
                          </h1>
                        </div>
                      );
                    });
                  });
                })}

              {/* add event preview */}
              {(showTodoPopup || showCalendarEventPreview) &&
                format(day, "yyyy-MM-dd") ==
                  format(selectedDay, "yyyy-MM-dd") && (
                  <div
                    className="calendar-event-preview"
                    style={{
                      top: `${
                        (parseInt(initialStartTime.split(":")[0]) +
                          parseInt(initialStartTime.split(":")[1]) / 60) *
                        pixelsPerHour
                      }px`,
                      height: `${initialDuration * pixelsPerHour}px`,
                    }}
                  ></div>
                )}
            </button>
          ))}
        </div>
        <div className="calendar-week-hours-wrapper-right"></div>
      </div>
    </div>
  );
}
