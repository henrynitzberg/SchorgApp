import { useState, useEffect } from "react";

import AddSpacePopUp from "./AddSpacePopUp.jsx";

import "../css/Sidebar.css";
import { all } from "axios";

const maxTodosDisplayed = 6;

export default function Sidebar({
  userTodos,
  setUserTodos,
  userDeliverables,
  setUserDeliverables,
  userSpaces,
  setUserSpaces,
  user,
}) {
  const [allTasks, setAllTasks] = useState([...userTodos, ...userDeliverables]);
  const [showSpacePopUp, setShowSpacePopUp] = useState(false);

  useEffect(() => {
    setAllTasks([...userTodos, ...userDeliverables]);
  }, [userTodos, userDeliverables]);

  useEffect(() => {
    setUserSpaces(userSpaces);
  }, [userSpaces]);

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-top">
        <div className="sidebar-top-widget">
          {allTasks.slice(0, maxTodosDisplayed).map((todo, i) => (
            <div key={i} className="upcoming-todo-wrapper">
              <div className="dot"></div>
              <p className="upcoming-todo">{todo.title}</p>
            </div>
          ))}
          {allTasks.length > maxTodosDisplayed && (
            <div className="sidebar-overflow-text">see more tasks</div>
          )}
        </div>
        <h1 className="sidebar-top-title">Todo</h1>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-widget">
          {userSpaces.map((space, i) => (
            <div key={i} className="space-wrapper">
              <p className="space">{space.name}</p>
              <button className="hide-space-button">
                <img
                  src="/eye.svg"
                  alt="Hide space icon"
                  className="hide-space-icon"
                />
              </button>
            </div>
          ))}
          <div className="add-space">
            <button
              className="add-space-button"
              onClick={() => setShowSpacePopUp(!showSpacePopUp)}
            >
              + add space
            </button>
          </div>
        </div>
        {showSpacePopUp && (
          <AddSpacePopUp
            setAddSpacePopUp={setShowSpacePopUp}
            userDeliverables={userDeliverables}
            setUserDeliverables={setUserDeliverables}
            userSpaces={userSpaces}
            setUserSpaces={setUserSpaces}
            user={user}
          />
        )}
        <h1 className="sidebar-bottom-title">Your Spaces</h1>
      </div>
    </div>
  );
}
