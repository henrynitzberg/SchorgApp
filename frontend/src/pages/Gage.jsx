import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar.jsx";
import CalendarWeek from "../components/CalendarWeek.jsx";

import "../css/Gage.css";

const APP_URL = "http://localhost:8000";

export default function Gage() {
  const [userTodos, setUserTodos] = useState([]);
  const [userDeliverables, setUserDeliverables] = useState([]);
  const [userSpaces, setUserSpaces] = useState([]);

  const email = "henry.nitzberg@nitzberg.henry";

  // loads user data
  useEffect(() => {
    async function loadUserData() {
      try {
        const userInfo = await axios.post(APP_URL + "/get-user", {
          email: email,
        });
        setUserTodos(userInfo.data.todos);
        setUserDeliverables(userInfo.data.user_deliverables);
        setUserSpaces(userInfo.data.user_spaces);
        console.log(userInfo.data.user_spaces);
      } catch (err) {
        console.error(err);
      }
    }
    loadUserData();
  }, []);

  return (
    <div className="gage-wrapper">
      {console.log(userSpaces)}
      <Sidebar
        todos={userTodos}
        deliverables={userDeliverables}
        spaces={userSpaces}
      />
      <div className="hero-wrapper">
        <CalendarWeek todos={userTodos} deliverables={userDeliverables} />
      </div>
      {/* <main className="main-content"><Outlet /></main> */}
    </div>
  );
}
