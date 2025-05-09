import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchSpaceData } from "../crud.js";

import axios from "axios";

import Sidebar from "../components/Sidebar.jsx";
import CalendarWeek from "../components/CalendarWeek.jsx";
import SelectedSpace from "../components/SelectedSpace.jsx";
import Navbar from "../components/Navbar.jsx";
import SpacesView from "../components/SpacesView.jsx";
import TodoView from "../components/TodoView.jsx";

import "../css/Gage.css";

const APP_URL = "http://localhost:8000";

export default function Gage() {
  const navigate = useNavigate();

  const [userTodos, setUserTodos] = useState([]);
  const [userDeliverables, setUserDeliverables] = useState([]);
  const [userSpaces, setUserSpaces] = useState([]);
  const [gageUser, setGageUser] = useState(null);

  const [view, setView] = useState("calendar");
  const [selectedSpaceInfo, setSelectedSpaceInfo] = useState(null);

  async function openSpace(e, spaceId) {
    const space = await fetchSpaceData(spaceId);
    console.log("space:", space);
    e.preventDefault();
    setView("selected-space");
    setSelectedSpaceInfo(space.data);
  }

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

    const email = localStorage.getItem("email");
    fetchUserData(email);
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
        openSpace={openSpace}
      />
      <div className="hero-wrapper">
        <Navbar view={view} setView={setView} />
        {view === "calendar" && (
          <CalendarWeek
            user={gageUser}
            userTodos={userTodos}
            setUserTodos={setUserTodos}
            userDeliverables={userDeliverables}
            setUserDeliverables={setUserDeliverables}
            userSpaces={userSpaces}
            setUserSpaces={setUserSpaces}
          />
        )}
        {view === "todo" && (
          <TodoView
            user={gageUser}
            userTodos={userTodos}
            setUserTodos={setUserTodos}
            userDeliverables={userDeliverables}
            setUserDeliverables={setUserDeliverables}
            userSpaces={userSpaces}
            setUserSpaces={setUserSpaces}
          />
        )}
        {view === "selected-space" && (
          <SelectedSpace space={selectedSpaceInfo} />
        )}
        {view === "spaces" && (
          <SpacesView userSpaces={userSpaces} openSpace={openSpace} />
        )}
      </div>
    </div>
  );
}
