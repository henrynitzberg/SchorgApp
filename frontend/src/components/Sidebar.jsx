import { useState, useEffect } from "react";

import AddSpacePopUp from "./AddSpacePopUp.jsx";
// import { toggleSpaceDisplay } from "../crud.js";

import "../css/Sidebar.css";

const maxTodosDisplayed = 6;

export default function Sidebar({
  userTodos,
  setUserTodos,
  userDeliverables,
  setUserDeliverables,
  userSpaces,
  setUserSpaces,
  user,
  openSpace,
}) {
  const [allTasks, setAllTasks] = useState([...userTodos, ...userDeliverables]);
  const [showSpacePopUp, setShowSpacePopUp] = useState(false);

  useEffect(() => {
    setAllTasks([...userTodos, ...userDeliverables]);
  }, [userTodos, userDeliverables]);

  async function toggleSpaceDeliverables(i) {
    setUserSpaces((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], shown: !updated[i].shown };
      return updated;
    });

    const userSpace = userSpaces[i];
    try {
      await toggleSpaceDisplay(user.email, userSpace._id, !userSpace.shown);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-top">
        <div className="sidebar-top-widget">
          {allTasks
            .filter((task) => {
              if ("deliverable" in task) {
                const matchingDeliverable = userDeliverables.find(
                  (d) => d._id === task.deliverable
                );
                if (!matchingDeliverable) return true;

                const matchingSpace = userSpaces.find(
                  (space) => space._id === matchingDeliverable.space
                );
                return matchingSpace ? matchingSpace.shown !== false : true;
              }

              // Else, it's a deliverable (has a space directly)
              const matchingSpace = userSpaces.find(
                (space) => space._id === task.space
              );
              return matchingSpace ? matchingSpace.shown !== false : true;
            })
            .slice(0, maxTodosDisplayed)
            .map((todo, i) => (
              <div key={i} className="upcoming-todo-wrapper">
                <div className="dot"></div>
                <p className="upcoming-todo">{todo.title}</p>
              </div>
            ))}
          {allTasks.length > maxTodosDisplayed && (
            <div className="sidebar-overflow-text">see more tasks</div>
          )}
          {allTasks.length <= 0 && (
            <div className="sidebar-empty-text-wrapper">
              <h1 className="sidebar-empty-text">Showing no tasks...</h1>
            </div>
          )}
        </div>
        <h1 className="sidebar-top-title">Todo</h1>
      </div>
      {/* <div className="sidebar-bottom">
        <div className="sidebar-bottom-widget">
          {userSpaces.map((space, i) => (
            <div key={i} className="space-selector-wrapper">
              <button
                className="space-selector"
                onClick={async (e) => await openSpace(e, space._id)}
              >
                {space.name}
              </button>

              <button
                className="hide-space-button"
                onClick={async () =>
                  await toggleSpaceDeliverables(i, space._id)
                }
              >
                <img
                  src={space.shown ? "/hide.svg" : "/eye.svg"}
                  alt="Hide space icon"
                  className="hide-space-icon"
                />
              </button>
            </div>
          ))}
          <div className="add-space">
            <button
              className="add-space-button"
              onClick={() => setShowSpacePopUp(true)}
            >
              + add space
            </button>
          </div>
        </div>
        {showSpacePopUp && (
          <AddSpacePopUp
            setShowSpacePopUp={setShowSpacePopUp}
            userDeliverables={userDeliverables}
            setUserDeliverables={setUserDeliverables}
            userSpaces={userSpaces}
            setUserSpaces={setUserSpaces}
            user={user}
          />
        )}
        <h1 className="sidebar-bottom-title">Your Spaces</h1>
      </div> */}
    </div>
  );
}
