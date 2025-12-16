import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoriesProvider } from './context/StoriesContext';
import { ThemeProvider } from './context/ThemeContext'; 
import NavBar from './components/NavBar';
import MainPage from './MainPage'; 
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ReadStories from './pages/ReadStories';
import StoryDetail from './pages/StoryDetail';
import Donate from './pages/Donate'; 
//import Chatbot from './components/Chatbot';

function App() {
  return (
    <AuthProvider>
      <StoriesProvider>
        <ThemeProvider> 
          <Router>
            <NavBar />
            {/* <Chatbot /> */}
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/read-stories" element={<ReadStories />} />
              <Route path="/story/:id" element={<StoryDetail />} />
              <Route path="/donate" element={<Donate />} /> 
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </Router>
        </ThemeProvider>
      </StoriesProvider>
    </AuthProvider>
  );
}

export default App;