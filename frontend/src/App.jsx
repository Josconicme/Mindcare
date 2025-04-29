import React, { useEffect } from 'react'
import Home from './Pages/Home'
import SignUp from './components/SignUp'
import Login from './components/Login'
import ContactUs from './components/ContactUs'
import About from './components/About'
import Services from './components/Services'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Profile from './components/Profile'
import DetailServices from './Pages/DetailServices'
import CreateProblem from './components/Problems/CreateProblem'
import TaskViewerPage from './Pages/TaskViewerPage'
import Completion from './Pages/Completion'
import AdminDashboard from './components/AdminDashboard'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'




const PrivateRoute = ({ children, isAdmin }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (isAdmin && user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate]);

  return user && (!isAdmin || user.role === 'admin') ? children : null;
};


const App = () => {




  return (
    <Router>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<ContactUs/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/services" element={<Services/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/services/:id" element={<DetailServices />} />
        <Route path="/create-problem" element={
        <PrivateRoute >
            <CreateProblem />
          </PrivateRoute>}/>
        <Route path="/tasks/:problemId" element={<TaskViewerPage/>}/> 
        <Route path="/completion" element={<Completion />} />
        <Route path="/admin" element={<PrivateRoute isAdmin={true}><AdminDashboard/></PrivateRoute>}/>

      </Routes>
    </Router>
  )
}

export default App
