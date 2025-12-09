import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LibraryView from "./components/LibraryView";
import FlipBookViewer from "./components/FlipBookViewer";
import ChatOverlay from "./components/ChatOverlay";

function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<LibraryView />} />
          <Route path="/read/:filename" element={<FlipBookViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatOverlay />
      </div>
    </BrowserRouter>
  );
}

export default App;
