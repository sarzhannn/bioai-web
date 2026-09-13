import { Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";
import Tool from "./Tool.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Tool />} />
    </Routes>
  );
}
