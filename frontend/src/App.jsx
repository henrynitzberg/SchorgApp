import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Gage from "./pages/Gage.jsx";
import Auth from "./pages/Auth.jsx";

import "./css/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />}></Route>
        <Route path="/gage" element={<Gage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
