import { useEffect, useRef } from "react";
import "../css/NewEventForm.css";

export default function NewEventForm({
  position,
  onClose,
  onSave,
  initialTime,
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

  return (
    <div
      ref={popupRef}
      className="event-popup-form"
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "black",
        color: "black",
        padding: "1em",
        border: "1px solid gray",
        borderRadius: "0.5em",
        zIndex: 100,
      }}
    >
      {/* Close "X" button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "0.25em",
          right: "0.5em",
          background: "none",
          border: "none",
          fontSize: "1.2em",
          
          cursor: "pointer",
        }}
        aria-label="Close form"
      >
        close!
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target;
          const title = form.title.value;
          const description = form.description.value;
          const startTime = form.startTime.value;
          const endTime = form.endTime.value;
          onSave({ title, description, startTime, endTime });
          onClose();
        }}
      >
        {/* need to style these individually */}
        <div>
          <label>Title:</label>
          <input name="title" style={{ color: "black", }}/>
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" />
        </div>
        <div>
          <label>Start Time:</label>
          <input name="startTime" type="time" defaultValue={initialTime} />
        </div>
        <div>
          <label>End Time:</label>
          <input name="endTime" type="time" />
        </div>
        <div style={{ marginTop: "0.5em" }}>
          <button type="submit">Save</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "0.5em" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
