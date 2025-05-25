import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Add more routes here as they are developed */}
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/signup" element={<div>Signup Page (Coming Soon)</div>} />
        <Route path="/find-ride" element={<div>Find Ride Page (Coming Soon)</div>} />
        <Route path="/post-ride" element={<div>Post Ride Page (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
