import { useRef, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isSnapped, setIsSnapped] = useState(false);
  const isDragging = useRef(false);

  const minColWidth = 100;
  const maxColWidth = 500;
  const postSnapWidth = 15;

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      // Check if the mouse is close to the left edge of the sidebar
      if (e.clientX <= minColWidth) {
        setIsSnapped(true);
        setSidebarWidth(postSnapWidth); // Snap to min width
      } else {
      setIsSnapped(false);
      setSidebarWidth(Math.min(Math.max(minColWidth, e.clientX), maxColWidth));
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="layout">
      <div className="sidebar" style={{ width: sidebarWidth }}>
        <Sidebar />
      </div>

      <div className="resizer" onMouseDown={handleMouseDown}/>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}