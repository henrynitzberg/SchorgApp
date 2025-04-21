import { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar.jsx";
import CalendarWeek from "../components/CalendarWeek.jsx";

import "../css/Gage.css";

const APP_URL = "http://localhost:8000";

export default function Gage() {
  const [userTodos, setUserTodos] = useState([]);
  const [userDeliverables, setUserDeliverables] = useState([]);

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
        console.log(userInfo);
      } catch (err) {
        console.log("bad user data");
        console.error(err);
      }
    }
    loadUserData();
  }, []);

  return (
    <div className="gage-wrapper">
      <Sidebar />
      <div className="hero-wrapper">
        <CalendarWeek todos={userTodos} deliverables={userDeliverables} />
      </div>
      {/* <main className="main-content"><Outlet /></main> */}
    </div>
  );
}
