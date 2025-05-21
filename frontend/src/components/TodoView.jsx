import { useEffect, useState, useRef } from "react";

import Calendar from "react-calendar";
import DatePickerPopUp from "./DatePickerPopUp.jsx";

import "../css/TodoView.css";
import "../css/ReactCalendar.css";
import { editTodo, updateTodos, removeTodos } from "../crud";

export default function TodoView({
  user,
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
  const [staged, setStaged] = useState([]);
  const [creating, setCreating] = useState(false);

  const inputRefs = useRef({});
  const pendingDeletesRef = useRef({});

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
    // TODO: inserting back into the same index isn't the best
    // if you added a task after deleting, and inserted it back right after
    // it would be out of order date-wise
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

    const key = `${deliverableIndex}-${todoIndex}`;
    const stagedTodo = sortedTasks[deliverableIndex]?.todos?.[todoIndex];
    const todoId = stagedTodo?._id;

    if (value) {
      const timeout = setTimeout(async () => {
        if (todoId) {
          console.log("it's being removed!");
          setSortedTasks((prev) =>
            prev.map((deliverable, i) => {
              if (i !== deliverableIndex) return deliverable;
              return {
                ...deliverable,
                todos: deliverable.todos.filter((_, j) => j !== todoIndex),
              };
            })
          );

          try {
            await removeTodos(user.email, [stagedTodo._id]);

            setUserTodos((prev) =>
              prev.filter((todo) => todo._id !== stagedTodo._id)
            );
          } catch (err) {
            console.error(err);
          }

          setStaged([
            ...staged,
            {
              ...stagedTodo,
              deliverableIndex: deliverableIndex,
            },
          ]);
        }
        delete pendingDeletesRef.current[key];
      }, 2000);

      pendingDeletesRef.current[key] = timeout;
    } else {
      if (pendingDeletesRef.current[key]) {
        clearTimeout(pendingDeletesRef.current[key]);
        delete pendingDeletesRef.current[key];
        console.log("canceled delete");
      }
    }
  }

  async function writeEditTodo(e, deliverableIndex, todoIndex) {
    // TODO: WRITE EDITS TO DB; ADD CALENDAR POP UP
    // Needs to write to userTodos because when you update a todo on
    // TodoView it doesnt show on the sidebar
    e.preventDefault();
    const newTitle = draftTodos?.[deliverableIndex]?.[todoIndex];
    if (newTitle === undefined) return;

    const toEditTodo = sortedTasks[deliverableIndex].todos[todoIndex];

    const newTodo = {
      title: newTitle,
      description: toEditTodo.description,
      start_time: toEditTodo.start_time,
      end_time: toEditTodo.end_time,
      deliverable: toEditTodo.deliverable,
      space: toEditTodo.space,
      _id: toEditTodo._id,
    };

    try {
      await editTodo(user.email, newTodo);
    } catch (err) {
      console.error(err);
    }

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

    setUserTodos((prev) =>
      prev.map((todo) => {
        if (todo._id === newTodo._id) {
          return newTodo;
        }
        return todo;
      })
    );

    setTodoEditMode(e, deliverableIndex, todoIndex, true);

    const textarea = inputRefs.current[deliverableIndex]?.[todoIndex];
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
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
          textarea.style.height = `${textarea.scrollHeight}px`;
        });
      }

      return updated;
    });
  }

  async function undoDelete(e) {
    e.preventDefault();
    const lastStagedTodo = staged[staged.length - 1];

    console.log("lastStagedTodo", lastStagedTodo);

    setSortedTasks((prev) => {
      const deliverableIndex = lastStagedTodo.deliverableIndex;
      const updatedTasks = [...prev];
      const updatedTodos = [
        ...updatedTasks[deliverableIndex].todos,
        {
          title: lastStagedTodo.title,
          description: lastStagedTodo.description,
          start_time: lastStagedTodo.start_time,
          start_date: lastStagedTodo.start_time,
          end_time: lastStagedTodo.end_time,
          end_date: lastStagedTodo.end_time,
          deliverable: lastStagedTodo.deliverable,
          space: lastStagedTodo.space,
          _id: lastStagedTodo._id,
          readOnly: true,
          checked: false,
          editDate: false,
        },
      ];

      updatedTodos.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );

      updatedTasks[deliverableIndex] = {
        ...updatedTasks[deliverableIndex],
        todos: updatedTodos,
      };

      return updatedTasks;
    });

    const newUserTodos = [
      ...userTodos,
      {
        title: lastStagedTodo.title,
        description: lastStagedTodo.description,
        start_time: lastStagedTodo.start_time,
        start_date: lastStagedTodo.start_time,
        end_date: lastStagedTodo.end_time,
        end_time: lastStagedTodo.end_time,
        deliverable: lastStagedTodo.deliverable,
        space: lastStagedTodo.space,
        _id: lastStagedTodo._id,
      },
    ];

    //   newUserTodos.sort(
    //     (a, b) => new Date(a.start_time) - new Date(b.start_time)
    //   );

    setUserTodos(newUserTodos);

    try {
      await updateTodos(user.email, [
        {
          title: lastStagedTodo.title,
          description: lastStagedTodo.description,
          start_time: lastStagedTodo.start_time,
          start_date: lastStagedTodo.start_time,
          end_time: lastStagedTodo.end_time,
          end_date: lastStagedTodo.end_time,
          deliverable: lastStagedTodo.deliverable,
          space: lastStagedTodo.space,
          _id: lastStagedTodo._id,
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    setStaged((prev) => prev.slice(0, -1));
  }

  async function closeAndDelete(e) {
    e.preventDefault();

    setStaged((prev) => prev.slice(0, -1));
  }

  function addTaskManual(e, deliverableIndex) {
    e.preventDefault();
    setCreating(true);

    const newTodo = {
      title: "",
      description: "",
      start_time: null,
      end_time: null,
      deliverable: sortedTasks[deliverableIndex]._id,
      space: null,
      readOnly: false,
      checked: false,
      editDate: false,
      _id: 0,
    };

    const updatedTasks = sortedTasks.map((deliverable, index) => {
      if (index === deliverableIndex) {
        return {
          ...deliverable,
          todos: [...deliverable.todos, newTodo],
        };
      }
      return deliverable;
    });

    const todoIndex = sortedTasks[deliverableIndex].todos.length;

    setSortedTasks(updatedTasks);
    setTimeout(() => {
      const input = inputRefs.current?.[deliverableIndex]?.[todoIndex];
      if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    }, 0);
  }

  function cancelAddTaskManual(e, deliverableIndex, todoIndex) {
    setSortedTasks((prev) =>
      prev.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        console.log("old:", deliverable.todos);
        const updatedTodos = deliverable.todos.slice(0, -1);
        console.log("new", updatedTodos);
        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );
    setCreating(false);
  }

  async function writeAddTaskManual(e, deliverableIndex, todoIndex) {
    // TODO: THIS DOESN'T WORK YET; AFTER YOU DELETE SOME TODOS YOU JUST CREATED
    // THEY'LL GET ADDED AGAIN ONCE YOU SAVE ANOTHER NEW ONE
    e.preventDefault();
    const newTitle = draftTodos?.[deliverableIndex]?.[todoIndex];
    if (newTitle === undefined) return;

    const toEditTodo = sortedTasks[deliverableIndex].todos[todoIndex];

    const newTodo = {
      title: newTitle,
      description: toEditTodo.description,
      start_time: toEditTodo.start_time,
      end_time: toEditTodo.end_time,
      deliverable: toEditTodo.deliverable,
      space: toEditTodo.space,
      _id: toEditTodo._id,
    };

    try {
      const newTodosWithId = await updateTodos(user.email, [newTodo]);
      setSortedTasks((prev) =>
        prev.map((deliverable, di) => {
          if (di !== deliverableIndex) return deliverable;

          const updatedTodos = deliverable.todos.map((todo, ti) => {
            if (ti !== todoIndex) return todo;

            return {
              ...todo,
              title: newTitle,
              _id: newTodosWithId[0],
            };
          });

          return {
            ...deliverable,
            todos: updatedTodos,
          };
        })
      );

      setUserTodos([...userTodos, ...newTodosWithId]);
    } catch (err) {
      console.error(err);
    }

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
    setCreating(false);

    const textarea = inputRefs.current[deliverableIndex]?.[todoIndex];
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }

  function editThisDate(e, deliverableIndex, todoIndex) {
    e.preventDefault();

    setSortedTasks((prevTasks) =>
      prevTasks.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, j) => {
          if (j !== todoIndex) return todo;
          return {
            ...todo,
            editDate: !todo.editDate,
          };
        });

        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );
  }

  function confirmLocalDateChange(e, deliverableIndex, todoIndex) {
    e.preventDefault();

    setSortedTasks((prevTasks) =>
      prevTasks.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, j) => {
          if (j !== todoIndex) return todo;
          return {
            ...todo,
            editDate: false,
          };
        });

        const sortedTodos = updatedTodos.sort((a, b) => {
          return new Date(a.start_time) - new Date(b.start_time);
        });

        return {
          ...deliverable,
          todos: sortedTodos,
        };
      })
    );
  }

  async function writeChangeDate(date, deliverableIndex, todoIndex) {
    const isoDate = new Date(date.toISOString());

    const toEditTodo = sortedTasks[deliverableIndex].todos[todoIndex];

    const newTodo = {
      title: toEditTodo.title,
      description: toEditTodo.description,
      start_time: isoDate,
      end_time: toEditTodo.end_time,
      deliverable: toEditTodo.deliverable,
      space: toEditTodo.space,
      _id: toEditTodo._id,
    };

    try {
      await editTodo(user.email, newTodo);
    } catch (err) {
      console.error(err);
    }

    setSortedTasks((prevTasks) =>
      prevTasks.map((deliverable, i) => {
        if (i !== deliverableIndex) return deliverable;

        const updatedTodos = deliverable.todos.map((todo, j) => {
          if (j !== todoIndex) return todo;
          return {
            ...todo,
            start_time: isoDate,
          };
        });

        return {
          ...deliverable,
          todos: updatedTodos,
        };
      })
    );
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
          editDate: false,
        });
      } else {
        unsorted.push(todo);
      }
    });

    deliverablesWithTodos.forEach((deliverable) => {
      deliverable.todos.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
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
          {/* {console.log(sortedTasks)} */}
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
                            key={todo._id}
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
                                    e.target.style.height = `${e.target.scrollHeight}px`;
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
                                <button
                                  className="todo-view-deliverable-todo-start-date"
                                  onClick={
                                    !todo.editDate
                                      ? (e) => editThisDate(e, i, index)
                                      : (e) =>
                                          confirmLocalDateChange(e, i, index)
                                  }
                                >
                                  <img
                                    src="/calendar.svg"
                                    alt="Todo calendar icon"
                                    className="todo-view-deliverable-todo-start-date-icon"
                                  />
                                  <p className="todo-view-deliverable-todo-start-date-text">
                                    {todo.start_time
                                      ? new Date(
                                          todo.start_time
                                        ).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                      : "--/--/----"}
                                  </p>
                                </button>
                                {todo.editDate && (
                                  <DatePickerPopUp
                                    value={
                                      todo.start_time
                                        ? new Date(todo.start_time)
                                        : null
                                    }
                                    onChange={async (date) =>
                                      await writeChangeDate(date, i, index)
                                    }
                                  />
                                )}
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
                                  onClick={
                                    !creating
                                      ? (e) => closeTodoEdit(e, i, index)
                                      : (e) => cancelAddTaskManual(e, i, index)
                                  }
                                >
                                  Cancel
                                </button>
                                <button
                                  className="todo-view-deliverable-save-button"
                                  onClick={
                                    !creating
                                      ? async (e) =>
                                          await writeEditTodo(e, i, index)
                                      : async (e) =>
                                          await writeAddTaskManual(e, i, index)
                                  }
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </form>
                        );
                      })}
                    {!creating && deliverable.open && (
                      <button
                        className="todo-view-add-todo"
                        onClick={(e) => addTaskManual(e, i)}
                      >
                        <img
                          src="/add.svg"
                          alt="Add task icon"
                          className="todo-view-add-todo-icon"
                        />
                        Add Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
      {staged.length > 0 && (
        <div className="todo-view-undo-button-wrapper">
          <p className="todo-view-staged-title">
            {staged[staged.length - 1].title}
          </p>
          completed
          {/* {staged.title} */}
          <div className="todo-view-undo-button-right">
            <button
              className="todo-view-undo-button"
              onClick={(e) => undoDelete(e)}
            >
              Undo
            </button>
            <button
              className="todo-view-undo-close-button"
              onClick={(e) => closeAndDelete(e)}
            >
              <img
                src="/close.svg"
                alt="Undo close icon"
                className="todo-view-undo-close-icon"
              />
            </button>
          </div>
        </div>
      )}
      {/* <DatePickerPopUp
        // value={todo.start_time ? new Date(todo.start_time) : null}
        value={new Date()}
        onChange={async (date) => await writeChangeDate(date, i, index)}
      /> */}
    </div>
  );
}
