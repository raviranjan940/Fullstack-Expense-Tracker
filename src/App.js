import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import 'react-toastify/dist/ReactToastify.css';
import Profile from './components/Profile';

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
