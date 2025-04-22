import { useEffect, useRef, useState } from "react";
import "../css/NewEventForm.css";

export default function NewEventForm({
  position,
  onClose,
  onSave,
  initialTime,
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
  const [error, setError] = useState(false);

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
          if (!title) {
            setTitleErrorMessage("Please enter a title.");
            clearErrorAfterDelay();
            setError(true);
          }

          const description = form.description.value;

          const startTime = form.startTime.value;
          const endTime = form.endTime.value;
          if (!startTime || !endTime) {
            setTimeErrorMessage("Please enter a start and end time.");
            clearErrorAfterDelay();
            setError(true);
          }
          
          // convert to dates
          // if (startTime > endTime) {
          //   setTimeErrorMessage("Start time must be before end time.");
          //   clearErrorAfterDelay();
          //   setError(true);
          // }

          if (error) {
            return;
          }

          // onSave({ title, description, startTime, endTime });
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
              className="time-input"
            />
          </div>
          <h1 className="event-popup-dash">-</h1>
          <div>
            <input
              name="endTime"
              type="text"
              placeholder="end"
              className="time-input"
            />
          </div>
        </div>
        {timeErrorMessage && <div className="error">{timeErrorMessage}</div>}
        {/* <div style={{ marginTop: "0.5em" }}>
          <button type="submit">Save</button>
          <button
            type="button"
            onClick={onClose}
            // style={{ marginLeft: "0.5em" }}
          >
            Cancel
          </button>
        </div> */}
        <div className="event-popup-bottom-buttons">
          <button className="event-popup-submit" type="submit">
            submit
          </button>
        </div>
      </form>
    </div>
  );
}
