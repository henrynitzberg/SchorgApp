import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// import { fetchUserData } from "../crud.js";
import Sidebar from "../components/Sidebar.jsx";
import CalendarWeek from "../components/CalendarWeek.jsx";

import "../css/Gage.css";

const APP_URL = "http://localhost:8000";

export default function Gage() {
  const navigate = useNavigate();
  const state = useLocation().state;

  const [userTodos, setUserTodos] = useState([]);
  const [userDeliverables, setUserDeliverables] = useState([]);
  const [userSpaces, setUserSpaces] = useState([]);
  const [gageUser, setGageUser] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth === null) {
      navigate("/");
    }

    async function fetchUserData(email) {
      try {
        const user = await axios.post(APP_URL + "/user/info", {
          email: email,
        });

        console.log("curr user: ", user.data.user);

        setGageUser(user.data.user);
        setUserTodos(user.data.user.todos);
        setUserDeliverables(user.data.user.user_deliverables);
        setUserSpaces(user.data.user.user_spaces);
      } catch (err) {
        throw err;
      }
    }

    fetchUserData(state.email);
  }, []);

  // localStorage.clear();

  return (
    <div className="gage-wrapper">
      <Sidebar
        userTodos={userTodos}
        setUserTodos={setUserTodos}
        userDeliverables={userDeliverables}
        setUserDeliverables={setUserDeliverables}
        userSpaces={userSpaces}
        setUserSpaces={setUserSpaces}
        user={gageUser}
      />
      <div className="hero-wrapper">
        <CalendarWeek todos={userTodos} deliverables={userDeliverables} />
      </div>
    </div>
  );
}
