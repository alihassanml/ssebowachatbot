import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chatbot from "./components/chatbot";

const App: React.FC = () => {
  const currentUrl = window.location.href;
  const url_id = currentUrl.split('http://localhost:5173/')[1]
  return (
    
    <Router>
      <Routes>
        <Route path="/:id" element={<Chatbot url={url_id} />} />
      </Routes>
    </Router>
  );
};

export default App;

