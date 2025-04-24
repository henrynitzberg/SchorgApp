import { useState, useEffect } from "react";

import AddSpacePopUp from "./AddSpacePopUp.jsx";

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

  // useEffect(() => {
  //   setUserSpaces(userSpaces);
  //   setShownSpaces([...shownSpaces, true]);
  // }, [userSpaces]);

  // useEffect(() => {
  //   setShownSpaces((prev) => {
  //     const newLength = userSpaces.length;
  //     const prevLength = prev.length;

  //     if (newLength > prevLength) {
  //       // Add `true` for each new space
  //       const added = Array(newLength - prevLength).fill(true);
  //       return [...prev, ...added];
  //     } else {
  //       // If userSpaces shrank or stayed the same, just trim or return prev
  //       return prev.slice(0, newLength);
  //     }
  //   });
  // }, [userSpaces]);

  // const spaches = [{ name: "CS daj adiow adi awid fweifhweo" }];

  function toggleSpaceDeliverables(i) {
    setUserSpaces((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], shown: !updated[i].shown };
      return updated;
    });

    console.log(userSpaces);
  }

  // function showSpaceDeliverables(i, spaceId) {}

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-top">
        <div className="sidebar-top-widget">
          {allTasks
            .filter((todo) => {
              const matchingSpace = userSpaces.find(
                (space) => space._id === todo.space
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
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-widget">
          {userSpaces.map((space, i) => (
            <div key={i} className="space-selector-wrapper">
              <button
                className="space-selector"
                onClick={(e) => openSpace(e, space)}
              >
                {space.name}
              </button>

              <button
                className="hide-space-button"
                onClick={() => toggleSpaceDeliverables(i, space._id)}
              >
                {console.log(space)}
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
