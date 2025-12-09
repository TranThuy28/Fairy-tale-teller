import React from "react";
import BookExhibition from "./BookExhibition";
import "./MainPage.css";

function MainPage() {
  return (
    <div className="main-page">
      <BookExhibition />
      
      {/* Other sections will go here */}
      <div className="content-section">
      </div>
    </div>
  );
}

export default MainPage;