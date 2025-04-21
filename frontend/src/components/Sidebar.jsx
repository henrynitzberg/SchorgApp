import { useState, useEffect } from "react";

import "../css/Sidebar.css";

// const allTasks = [
//   "get groceries",
//   "figure out a time to meet with henry to work on project",
//   "send email to professor",
//   "get gas",
//   "get body wash",
//   "avocado, apples, bananas, kefir, green tea, cream, rice",
//   "make E2E SD repo pretty",
//   "make $100,000 by tomorrow",
//   "read paper",
//   "arson",
//   "launder the children's money",
//   "think of other fake todos to do",
// ];

// const spaces = [
//   "CS 15",
//   "High Paying Job",
//   "Art Class",
//   "Swimning",
//   "Clibbing",
// ];

const maxTodosDisplayed = 6;

export default function Sidebar({ todos, deliverables, spaces }) {
  const [allTasks, setAllTasks] = useState([...todos, ...deliverables]);
  const [userSpaces, setUserSpaces] = useState(spaces);

  useEffect(() => {
    setAllTasks([...todos, ...deliverables]);
  }, [todos, deliverables]);

  useEffect(() => {
    setUserSpaces(spaces);
  }, [spaces]);

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
              <p className="space">{space.title}</p>
            </div>
          ))}
        </div>
        <h1 className="sidebar-bottom-title">Your Spaces</h1>
      </div>
    </div>
  );
}
