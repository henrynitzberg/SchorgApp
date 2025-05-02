import { useState } from "react";
import axios from "axios";

import {
  accessClass,
  updateUserDeliverables,
  updateSpacePeople,
  updateUserSpaces,
} from "../crud";

import "../css/AddSpacePopUp.css";

export default function AddSpacePopUp({
  userTodos,
  setUserTodos,
  userDeliverables,
  setUserDeliverables,
  setShowSpacePopUp,
  userSpaces,
  setUserSpaces,
  user,
}) {
  const [enteredToken, setEnteredToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function getSpaceDeliverables(space) {
    const spaceDeliverables = space.data.space_deliverables;
    const newDeliverables = [];
    for (const deliverable of spaceDeliverables) {
      newDeliverables.push({
        title: deliverable.title,
        description: deliverable.description,
        due_date: deliverable.due_date,
        time_worked: 0,
        space: space.data._id,
        space_deliverable: deliverable._id,
      });
    }

    return newDeliverables;
  }

  async function submitAccessToken(e) {
    e.preventDefault();
    try {
      const space = await accessClass(enteredToken);

      for (const userSpace of userSpaces) {
        if (space.data._id === userSpace._id) {
          setErrorMessage("You're already registered for this class.");
          return;
        }
      }

      const newDeliverables = getSpaceDeliverables(space);
      setUserDeliverables([...userDeliverables, ...newDeliverables]);
      setUserSpaces([...userSpaces, space.data]);

      await updateUserDeliverables(user.email, newDeliverables);
      await updateSpacePeople(space.data._id, [
        {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      ]);
      await updateUserSpaces(user.email, [
        {
          _id: space.data._id,
          name: space.data.name,
          shown: true,
        },
      ]);
    } catch (err) {
      console.error(err);
      setErrorMessage("Invalid space token");
    } finally {
      setEnteredToken("");
      // setAddSpacePopUp(false);
    }
  }

  return (
    <form className="add-space-wrapper">
      <label htmlFor="access-token" className="add-space-input-header">
        Add Class
      </label>
      <input
        name="access-token"
        placeholder="Access code"
        type="text"
        className="add-space-input"
        value={enteredToken}
        onChange={(e) => setEnteredToken(e.target.value)}
      />
      {errorMessage.length > 0 && (
        <p className="error-message">{errorMessage}</p>
      )}
      <button
        className="add-space-confirm"
        onClick={(e) => submitAccessToken(e)}
      >
        Confirm
      </button>

      <button
        className="add-space-close-button"
        onClick={() => setShowSpacePopUp(false)}
      >
        X
      </button>
    </form>
  );
}
