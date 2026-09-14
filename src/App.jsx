import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";
import Tool from "./Tool.jsx";

export default function App() {
  const [lang, setLang] = useState("ru");
  return (
    <Routes>
      <Route path="/" element={<Landing lang={lang} setLang={setLang} />} />
      <Route path="/app" element={<Tool lang={lang} setLang={setLang} />} />
    </Routes>
  );
}
