import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Layout from "./components/Layout.jsx";

import "./css/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
