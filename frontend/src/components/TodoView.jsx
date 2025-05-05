import { useEffect, useState, useRef } from "react";

import "../css/TodoView.css";

export default function TodoView({
  userTodos,
  setUserTodos,
  userDeliverables,
  setUserDeliverables,
  userSpaces,
  setUserSpaces,
}) {
  const [sortedTasks, setSortedTasks] = useState([]);
  const [unsortedTasks, setUnsortedTasks] = useState([]);

  const [draftTodos, setDraftTodos] = useState({});

  const inputRefs = useRef({});

  function setTodoEditMode(e, deliverableIndex, todoIndex, value) {
    e.preventDefault();
    setSortedTasks((prevTasks) =>
      prevTasks.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, j) => {
          if (j !== todoIndex) return todo;
          return {
            ...todo,
            readOnly: value,
          };
        });

        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );
  }

  function setTodoCheckedStatus(e, deliverableIndex, todoIndex, value) {
    setSortedTasks((prevTasks) =>
      prevTasks.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, j) => {
          if (j !== todoIndex) return todo;
          return {
            ...todo,
            checked: value,
          };
        });

        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );
  }

  function writeLocalTodoEdit(e, deliverableIndex, todoIndex) {
    // TODO: WRITE EDITS TO DB; ADD CALENDAR POP UP
    e.preventDefault();
    const newTitle = draftTodos?.[deliverableIndex]?.[todoIndex];
    if (newTitle === undefined) return;
    setSortedTasks((prev) =>
      prev.map((deliverable, di) => {
        if (di !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, ti) => {
          if (ti !== todoIndex) return todo;

          return {
            ...todo,
            title: newTitle,
          };
        });

        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );

    setDraftTodos((prev) => {
      const updated = { ...prev };
      if (updated[deliverableIndex]) {
        delete updated[deliverableIndex][todoIndex];
        if (Object.keys(updated[deliverableIndex]).length === 0) {
          delete updated[deliverableIndex];
        }
      }
      return updated;
    });

    setTodoEditMode(e, deliverableIndex, todoIndex, true);
  }

  function toggleDeliverableSubtasks(e, index) {
    e.preventDefault();
    setSortedTasks((prevTasks) =>
      prevTasks.map((task, i) =>
        i === index ? { ...task, open: !task.open } : task
      )
    );
  }

  function openTodoEdit(e, deliverableIndex, todoIndex) {
    e.preventDefault();
    setTodoEditMode(e, deliverableIndex, todoIndex, false);

    setTimeout(() => {
      const input = inputRefs.current?.[deliverableIndex]?.[todoIndex];
      if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    }, 0);
  }

  function closeTodoEdit(e, deliverableIndex, todoIndex) {
    e.preventDefault();
    setTodoEditMode(e, deliverableIndex, todoIndex, true);

    setDraftTodos((prev) => {
      const updated = { ...prev };
      if (updated[deliverableIndex]) {
        delete updated[deliverableIndex][todoIndex];
        if (Object.keys(updated[deliverableIndex]).length === 0) {
          delete updated[deliverableIndex];
        }
      }

      const textarea = inputRefs.current[deliverableIndex]?.[todoIndex];
      if (textarea) {
        requestAnimationFrame(() => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight + 6}px`;
        });
      }

      return updated;
    });
  }

  useEffect(() => {
    const deliverablesWithTodos = userDeliverables.map((deliverable) => ({
      ...deliverable,
      todos: [],
      open: true,
    }));
    const deliverableMap = {};
    deliverablesWithTodos.forEach((deliverable) => {
      deliverableMap[deliverable._id] = deliverable;
    });

    const unsorted = [];

    userTodos.forEach((todo) => {
      if (todo.deliverable && deliverableMap[todo.deliverable]) {
        deliverableMap[todo.deliverable].todos.push({
          ...todo,
          readOnly: true,
          checked: false,
        });
      } else {
        unsorted.push(todo);
      }
    });

    setSortedTasks(deliverablesWithTodos);
    setUnsortedTasks(unsorted);
  }, [userTodos, userDeliverables]);

  return (
    <div className="todo-view-wrapper">
      <h1 className="todo-view-header">Todo</h1>
      <div className="todo-view-content-wrapper">
        <h1 className="todo-view-content-header">Sorted</h1>
        <div className="todo-view-deliverables-wrapper">
          {console.log(sortedTasks)}
          {sortedTasks ? (
            sortedTasks.map((deliverable, i) => {
              return (
                <div key={i} className="todo-view-deliverable-wrapper">
                  <div className="todo-view-deliverable">
                    <div className="todo-view-deliverable-left">
                      <button className="todo-view-toggle-deliverable">
                        <img
                          src={
                            deliverable.open
                              ? "/shown-drop.svg"
                              : "/hidden-drop.svg"
                          }
                          alt="Show todos icon"
                          className="todo-view-toggle-deliverable-icon"
                          onClick={(e) => {
                            toggleDeliverableSubtasks(e, i);
                          }}
                        />
                      </button>
                      <button key={i} className="todo-view-deliverable-title">
                        {deliverable.title}
                      </button>
                    </div>
                    <div className="todo-view-deliverable-right">
                      <button className="todo-view-deliverable-due-date">
                        {new Date(deliverable.due_date).toLocaleString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </button>
                      <button className="todo-view-visit-deliverable">
                        <img
                          src="/open.svg"
                          alt="Show todos icon"
                          className="todo-view-visit-deliverable-icon"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="todo-view-deliverables-todos-wrapper">
                    {deliverable.open &&
                      deliverable.todos.map((todo, index) => {
                        return (
                          <form
                            key={index}
                            action=""
                            className={
                              todo.readOnly
                                ? "todo-view-deliverable-todo"
                                : "todo-view-deliverable-todo-edit"
                            }
                          >
                            <div
                              className={
                                !todo.checked
                                  ? todo.readOnly
                                    ? "todo-view-deliverable-todo-wrapper"
                                    : "todo-view-deliverable-todo-wrapper-edit"
                                  : "todo-view-deliverable-todo-wrapper-edit"
                              }
                            >
                              {todo.readOnly && (
                                <input
                                  type="checkbox"
                                  className="todo-view-deliverable-todo-checkbox"
                                  onChange={(e) => {
                                    setTodoCheckedStatus(
                                      e,
                                      i,
                                      index,
                                      e.target.checked
                                    );
                                  }}
                                />
                              )}
                              <div
                                className={
                                  todo.readOnly
                                    ? "todo-view-deliverable-todo-content-wrapper"
                                    : "todo-view-deliverable-todo-content-wrapper-edit"
                                }
                              >
                                <textarea
                                  ref={(el) => {
                                    if (!inputRefs.current[i])
                                      inputRefs.current[i] = {};
                                    inputRefs.current[i][index] = el;
                                  }}
                                  className={
                                    !todo.checked
                                      ? todo.readOnly
                                        ? "todo-view-deliverable-todo-header"
                                        : "todo-view-deliverable-todo-header-edit"
                                      : "todo-view-deliverable-todo-header-complete"
                                  }
                                  value={
                                    draftTodos?.[i]?.[index] !== undefined
                                      ? draftTodos[i][index]
                                      : todo.title
                                  }
                                  rows={1}
                                  onChange={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${
                                      e.target.scrollHeight + 6
                                    }px`;
                                    const newValue = e.target.value;
                                    setDraftTodos((prev) => ({
                                      ...prev,
                                      [i]: {
                                        ...prev[i],
                                        [index]: newValue,
                                      },
                                    }));
                                  }}
                                  readOnly={todo.readOnly}
                                />
                                <button className="todo-view-deliverable-todo-start-date">
                                  <img
                                    src="/calendar.svg"
                                    alt="Todo calendar icon"
                                    className="todo-view-deliverable-todo-start-date-icon"
                                  />
                                  <p className="todo-view-deliverable-todo-start-date-text">
                                    {new Date(
                                      deliverable.due_date
                                    ).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </p>
                                </button>
                              </div>
                              {todo.readOnly && !todo.checked && (
                                <button className="todo-view-deliverable-todo-edit-button">
                                  <img
                                    src={
                                      todo.readOnly ? "/edit.svg" : "/save.svg"
                                    }
                                    alt="Todo edit icon"
                                    className="todo-view-deliverable-todo-edit-icon"
                                    onClick={(e) => {
                                      openTodoEdit(e, i, index);
                                    }}
                                  />
                                </button>
                              )}
                            </div>
                            {!todo.readOnly && (
                              <div className="todo-view-deliverable-crud-buttons">
                                <button
                                  className="todo-view-deliverable-cancel-button"
                                  onClick={(e) => closeTodoEdit(e, i, index)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="todo-view-deliverable-save-button"
                                  onClick={(e) =>
                                    writeLocalTodoEdit(e, i, index)
                                  }
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </form>
                        );
                      })}
                  </div>
                </div>
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
