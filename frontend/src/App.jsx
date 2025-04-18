import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Gage from "./pages/Gage.jsx";

import "./css/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
