import "../css/Navbar.css";

export default function Navbar({ view, setView }) {
  return (
    <nav className="navbar-wrapper">
      <div className="navbar-content-wrapper">
        <div className="navbar-left-buttons">
          <button
            className={
              view === "calendar"
                ? "navbar-view-button-selected"
                : "navbar-view-button"
            }
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
          <button
            className={
              view === "todo"
                ? "navbar-view-button-selected"
                : "navbar-view-button"
            }
            onClick={() => setView("todo")}
          >
            Todo
          </button>
          <button
            className={
              view === "spaces"
                ? "navbar-view-button-selected"
                : "navbar-view-button"
            }
            onClick={() => setView("spaces")}
          >
            Spaces
          </button>
        </div>
        <div className="settings-button-wrapper">
          <button
            className="settings-button"
            onClick={() => console.log("Settings clicked")}
            draggable="false"
          >
            <img
              src="/gear.svg"
              draggable="false"
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
