import Sidebar from "../components/Sidebar.jsx";
import CalendarWeek from "../components/CalendarWeek.jsx";

import "../css/Gage.css";

export default function Gage() {
  return (
    <div className="gage-wrapper">
      <Sidebar />
      <div className="hero-wrapper">
        <CalendarWeek />
      </div>
      {/* <main className="main-content"><Outlet /></main> */}
    </div>
  );
}
