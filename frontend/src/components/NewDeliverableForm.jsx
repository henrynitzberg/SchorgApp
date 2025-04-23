import { useEffect, useRef, useState } from "react";
import "../css/NewDeliverableForm.css";
// TODO: modular styling --
// currently this file uses some styling from NewToDoForm.css

export default function NewDeliverableForm({
  position,
  initialDueDay,
  onSubmit,
  onClose,
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
  const [dateErrorMessage, setDateErrorMessage] = useState("");
  const [timeErrorMessage, setTimeErrorMessage] = useState("");

  const [initialDueDayMonth, setInitialDueDayMonth] = useState(
    initialDueDay.getMonth() + 1
  ); // Months are zero-based
  const [initialDueDayDay, setInitialDueDayDay] = useState(
    initialDueDay.getDate()
  );
  const [initialDueDayYear, setInitialDueDayYear] = useState(
    initialDueDay.getFullYear()
  );
  const [initialDueDayHour, setInitialDueDayHour] = useState(23);
  const [initialDueDayMinute, setInitialDueDayMinute] = useState(59);

  const clearErrorAfterDelay = () => {
    setTimeout(() => {
      setTitleErrorMessage("");
    }, 3000); // 3 seconds
    setTimeout(() => {
      setDateErrorMessage("");
    }, 3000);
    setTimeout(() => {
      setTimeErrorMessage("");
    }, 3000);
  };

  return (
    <div
      ref={popupRef}
      className="deliverable-popup-form"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {/* Close "X" button */}
      <div
        className="deliverable-popup-X-button-wrapper"
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
          if (!title || title.length < 1) {
            setTitleErrorMessage("Please enter a title.");
            clearErrorAfterDelay();
            return;
          }

          const description = form.description.value;

          const dueDate = form.dueDate.value;
          const dueTime = form.dueTime.value;

          if (!dueDate || !dueTime) {
            setDateErrorMessage("Please enter a due date and time.");
            clearErrorAfterDelay();
            return;
          }
          const dueDateParts = dueDate.split("/");
          const dueTimeParts = dueTime.split(":");
          const dueDayMonth = parseInt(dueDateParts[0]);
          const dueDayDay = parseInt(dueDateParts[1]);
          const dueDayYear = parseInt(dueDateParts[2]);
          const dueDayHour = parseInt(dueTimeParts[0]);
          const dueDayMinute = parseInt(dueTimeParts[1]);

          // Check if due date is valid
          if (
            isNaN(dueDayMonth) ||
            isNaN(dueDayDay) ||
            isNaN(dueDayYear) ||
            isNaN(dueDayHour) ||
            isNaN(dueDayMinute)
          ) {
            setDateErrorMessage("Please enter a valid due date.");
            clearErrorAfterDelay();
            return;
          }

          // Check if date is valid
          const dueDateObj = new Date(
            dueDayYear,
            dueDayMonth - 1,
            dueDayDay,
          );
          if (
            dueDateObj.getFullYear() !== dueDayYear ||
            dueDateObj.getMonth() !== dueDayMonth - 1 ||
            dueDateObj.getDate() !== dueDayDay
          ) {
            setDateErrorMessage("Please enter a valid date.");
            clearErrorAfterDelay();
            return;
          }

          // Check if time is valid
          if (
            dueDayHour < 0 ||
            dueDayHour > 23 ||
            dueDayMinute < 0 ||
            dueDayMinute > 59
          ) {
            setTimeErrorMessage("Please enter a valid time.");
            clearErrorAfterDelay();
            return;
          }

          onSubmit({
            title,
            description,
            dueDate,
            dueTime,
          });
          onClose();
        }}
      >
        <div className="deliverable-popup-title"> New Deliverable </div>
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

        <h1 className="deliverable-popup-subtitle">Due Date</h1>

        <div className="deliverable-popup-due-date-wrapper">
          <div>
            <input
              name="dueDate"
              type="text"
              placeholder="date"
              defaultValue={`${initialDueDayMonth}/${initialDueDayDay}/${initialDueDayYear}`}
              className="date-input"
            />
          </div>
          <h1 className="deliverable-popup-at">at</h1>
          <div>
            <input
              name="dueTime"
              type="text"
              placeholder="time"
              defaultValue={initialDueDayHour + ":" + initialDueDayMinute}
              className="time-input"
            />
          </div>
        </div>
        {timeErrorMessage && <div className="error">{timeErrorMessage}</div>}
        {dateErrorMessage && <div className="error">{dateErrorMessage}</div>}

        <div className="deliverable-popup-bottom-buttons-wrapper">
          <button className="deliverable-popup-button" type="submit">
            submit
          </button>
          <button className="deliverable-popup-button" onClick={onClose}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
