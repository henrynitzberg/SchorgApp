import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home.jsx";

import "./css/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
