import { useState } from "react";
import axios from "axios";

import {
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
  setAddSpacePopUp,
  userSpaces,
  setUserSpaces,
  user,
}) {
  const [enteredToken, setEnteredToken] = useState("");
  const APP_URL = "http://localhost:8000";

  async function submitAccessToken(e) {
    e.preventDefault();
    try {
      const space = await axios.post(APP_URL + "/space/info", {
        access_code: enteredToken,
      });

      for (const userSpace of userSpaces) {
        if (space.data._id === userSpace._id) {
          alert("You're already registered for this class.");
          return;
        }
      }

      setUserSpaces([...userSpaces, space.data]);
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
      setUserDeliverables([...userDeliverables, ...newDeliverables]);
      updateUserDeliverables(user.email, newDeliverables);
      updateSpacePeople(space.data._id, [
        {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      ]);
      updateUserSpaces(user.email, [
        {
          _id: space.data._id,
          name: space.data.name,
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Invalid space token");
    } finally {
      setEnteredToken("");
      setAddSpacePopUp(false);
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
      <button
        className="add-space-confirm"
        onClick={(e) => submitAccessToken(e)}
      >
        Confirm
      </button>
    </form>
  );
}
