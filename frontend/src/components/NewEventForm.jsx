import { useEffect, useRef, useState } from "react";
import "../css/NewEventForm.css";

export default function NewEventForm({
  position,
  initialStartTime,
  initialEndTime,
  onClose,
  onSave,
  editMode,
}) {
  const popupRef = useRef(null);

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

  return (
    <div
      ref={popupRef}
      className="event-popup-form"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {/* Close "X" button */}
      <div
        className="event-popup-X-button-wrapper"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        x
      </div>
      <form
        onSubmit={(e) => {
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
          if (startHour > endHour || startHour === endHour && startMinute >= endMinute) {
            setTimeErrorMessage("Start time must be before end time.");
            clearErrorAfterDelay();
            return;
          }

          if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
            setTimeErrorMessage("Please enter a valid start time.");
            clearErrorAfterDelay();
            return;
          }
          if (endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
            setTimeErrorMessage("Please enter a valid end time.");
            clearErrorAfterDelay();
            return;
          }

          onSave({ title, description, startTime, endTime });
          onClose();
        }}
      >
        <div className="event-popup-title"> New Event </div>
        <div>
          <input
            name="title"
            type="text"
            placeholder="Title"
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
            ref={descriptionRef}
            onInput={handleInput}
          />
        </div>

        <h1 className="event-popup-duration-title">Duration</h1>
        <div className="event-popup-duration-wrapper">
          <div>
            <input
              name="startTime"
              type="text"
              placeholder="start"
              defaultValue={initialStartTime}
              className="time-input"
            />
          </div>
          <h1 className="event-popup-dash">-</h1>
          <div>
            <input
              name="endTime"
              type="text"
              placeholder="end"
              defaultValue={initialEndTime}
              className="time-input"
            />
          </div>
        </div>
        {timeErrorMessage && <div className="error">{timeErrorMessage}</div>}
        <div className="event-popup-bottom-buttons-wrapper">
          <button className="event-popup-button" type="submit">
            submit
          </button>
          <button className="event-popup-button" onClick={onClose}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
