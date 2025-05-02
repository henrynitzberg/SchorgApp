import { useState, useEffect } from "react";

import "../css/SelectedSpace.css";

export default function SelectedSpace({ space }) {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showGrades, setShowGrades] = useState(true);

  useEffect(() => {
    setSelectedSpace(space);
  }, [space]);

  return (
    <div className="selected-space-wrapper">
      <div className="selected-space-header-wrapper">
        <h1 className="selected-space-header">
          {selectedSpace ? selectedSpace.name : ""}
        </h1>
        <div className="selected-space-header-wrapper-right">
          <button className="forum-nav-button">
            <img src="/forum.svg" alt="Forum icon" className="forum-nav-img" />
            Forum
          </button>
        </div>
      </div>
      <div className="selected-space-content-wrapper">
        <h1 className="selected-space-content-header">Deliverables</h1>
        <div className="selected-space-content-top-bar">
          <h2 className="selected-space-content-top-bar-title">Name</h2>
          <h2 className="selected-space-content-top-bar-title">Due Date</h2>
          <h2 className="selected-space-content-top-bar-title">Status</h2>
          <div className="selected-space-deliverable-grade-wrapper">
            <h2 className="selected-space-content-top-bar-title">Grade</h2>
            <button
              className="selected-space-deliverable-grade-toggle"
              onClick={() => setShowGrades(!showGrades)}
            >
              <img
                src={showGrades ? "/hide.svg" : "/eye.svg"}
                alt="Show grade icon"
                className="selected-space-deliverable-grade-icon"
              />
            </button>
          </div>
        </div>
        <div className="selected-space-deliverables-wrapper">
          {selectedSpace ? (
            selectedSpace.space_deliverables.map((deliverable, i) => {
              return (
                <button className="selected-space-deliverable-wrapper">
                  <p key={i} className="selected-space-deliverable-title">
                    {deliverable.title}
                  </p>
                  <p className="selected-space-deliverable-due-date">
                    {new Date(deliverable.due_date).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <div className="selected-space-deliverable-status-wrapper">
                    <div className="selected-space-deliverable-status-indicator"></div>
                    <p className="selected-space-deliverable-status">
                      Not submitted
                    </p>
                  </div>
                  <p className="selected-space-deliverable-grade">
                    {deliverable.gradable
                      ? showGrades
                        ? deliverable.grade + "/" + deliverable.max_grade
                        : "---"
                      : "N?A"}
                  </p>
                </button>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
