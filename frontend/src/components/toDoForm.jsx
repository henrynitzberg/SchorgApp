import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import "../css/toDoForm.css";

export default function ToDoForm({
  position,
  initialStartTime,
  initialEndTime,
  deliverables,
  onSave,
  onClose,
  onEdit,
  editMode,
  eventData = null,
  handleRemoveTodo = null,
}) {
  const popupRef = useRef(null);

  const startTime = editMode
    ? format(eventData.start_time, "HH:mm")
    : initialStartTime;
  const endTime = editMode
    ? format(eventData.end_time, "HH:mm")
    : initialEndTime;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const descriptionRef = useRef();

  const handleInput = () => {
    const el = descriptionRef.current;
    el.style.height = "auto"; // reset
    el.style.height = `${el.scrollHeight}px`; // grow to content
  };

  const [titleErrorMessage, setTitleErrorMessage] = useState("");
  const [timeErrorMessage, setTimeErrorMessage] = useState("");

  const clearErrorAfterDelay = () => {
    setTimeout(() => {
      setTitleErrorMessage("");
    }, 3000); // 3 seconds
    setTimeout(() => {
      setTimeErrorMessage("");
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const title = form.title.value;
    if (!title || title.length === 0) {
      setTitleErrorMessage("Please enter a title.");
      clearErrorAfterDelay();
      return;
    }

    const description = form.description.value;

    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    if (!startTime || !endTime) {
      setTimeErrorMessage("Please enter a start and end time.");
      clearErrorAfterDelay();
      return;
    }

    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    const endHour = parseInt(endTime.split(":")[0]);
    const endMinute = parseInt(endTime.split(":")[1]);

    // Check if start time is before end time
    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      setTimeErrorMessage("Start time must be before end time.");
      clearErrorAfterDelay();
      return;
    }

    if (
      startHour < 0 ||
      startHour > 23 ||
      startMinute < 0 ||
      startMinute > 59
    ) {
      setTimeErrorMessage("Please enter a valid start time.");
      clearErrorAfterDelay();
      return;
    }
    if (endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
      setTimeErrorMessage("Please enter a valid end time.");
      clearErrorAfterDelay();
      return;
    }

    const deliverableTitle = form.deliverable.value;
    const deliverable = deliverables.find(
      (deliverable) => deliverable.title === deliverableTitle
    );

    if (editMode) {
      onEdit(
        { title, description, startTime, endTime, deliverable },
        eventData._id
      );
    } else {
      onSave({ title, description, startTime, endTime, deliverable });
    }
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="todo-popup-form"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {/* Close "X" button */}
      <div
        className="todo-popup-X-button-wrapper"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        x
      </div>

      {/* Delete button */}
      {editMode && (
        <div
          className="todo-popup-delete-button-wrapper"
          onClick={(e) => {
            handleRemoveTodo(eventData);
            onClose();
          }}
        >
          <img
            src={"/trash-gray.svg"}
            alt="delete todo icon"
            className="delete-todo-icon"
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="todo-popup-title">
          {" "}
          {editMode ? "Edit ToDo" : "New ToDo"}{" "}
        </div>
        <div>
          <input
            name="title"
            type="text"
            placeholder="Title"
            defaultValue={editMode ? eventData.title : ""}
            className="title-input"
          />
        </div>
        {titleErrorMessage && <div className="error">{titleErrorMessage}</div>}

        <div>
          <textarea
            name="description"
            type="text"
            placeholder="Description"
            className="description-input"
            defaultValue={editMode ? eventData.description : ""}
            ref={descriptionRef}
            onInput={handleInput}
          />
        </div>

        <h1 className="todo-popup-subtitle">Duration</h1>
        <div className="todo-popup-duration-wrapper">
          <div>
            <input
              name="startTime"
              type="text"
              placeholder="start"
              defaultValue={startTime}
              className="time-input"
            />
          </div>
          <h1 className="todo-popup-dash">-</h1>
          <div>
            <input
              name="endTime"
              type="text"
              placeholder="end"
              defaultValue={endTime}
              className="time-input"
            />
          </div>
        </div>
        {timeErrorMessage && <div className="error">{timeErrorMessage}</div>}

        <h1 className="todo-popup-subtitle">Deliverable</h1>
        <div>
          <select
            name="deliverable"
            className="deliverable-select"
            defaultValue={
              editMode && eventData.deliverable
                ? deliverables.find(
                    (deliverable) =>
                      deliverable._id === eventData.deliverable
                  ).title
                : ""
            }
          >
            <option value="">(none)</option>
            {deliverables.map((deliverable, i) => (
              <option key={i} value={deliverable.title}>
                {deliverable.title}
              </option>
            ))}
          </select>
        </div>

        <div className="todo-popup-bottom-buttons-wrapper">
          <button className="todo-popup-button" type="submit">
            submit
          </button>
          <button className="todo-popup-button" onClick={onClose}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
