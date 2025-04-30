import React, { useState, useEffect, use } from 'react';
import { Link, useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { getProblems, getRecoveries, getTasks, getUsers} from '../utils/api';
import './AdminDashboard.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



const WidgetCard = ({ title, count }) => (
  <div className="widget-card">
    <h3>{title}</h3>
    <p>{count}</p>
  </div>
);

const RecentItem = ({ item }) => (
    <li className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex justify-between items-center">
            <p className="font-medium text-gray-800">{item.name}</p>
            <div className="flex items-center text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
            </div>
        </div>
    </li>
);


const RecentList = ({ title, items }) => {
  return (
    <div className="recent-list">
       <h3>{title}</h3>
      <ul>{items.map((item, index) => <RecentItem key={index} item={item} />)}</ul>
    </div>
  );
};


const AdminDashboard = () => {
  const [activeLink, setActiveLink] = useState('Dashboard');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);


  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [newProblems, setNewProblems] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [newTasks, setNewTasks] = useState(0);
  const [totalRecoveries, setTotalRecoveries] = useState(0);
  const [newRecoveries, setNewRecoveries] = useState(0);
  const [recentProblems, setRecentProblems] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentRecoveries, setRecentRecoveries] = useState([]);

  if (!user || user.role !== 'admin') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateClick = () => {
    // Navigate to the creation page based on the active link
    switch (activeLink) {
      case 'Users Management': return navigate('/admin/users/create') ;
      case 'Problems Management': return navigate('/admin/problems/create');
      case 'Tasks Management': return navigate('/admin/tasks/create');
      case 'Recoveries Management': return navigate('/admin/recoveries/create');
      default: return navigate(`/admin/${activeLink.toLowerCase()}`);
    }
  
  };


  const fetchData = async () => {
    try {
      const usersData = await getUsers();
      const problemsData = await getProblems();
      const tasksData = await getTasks();
      const recoveriesData = await getRecoveries();

      setTotalUsers(usersData.length);
      setNewUsers(usersData.filter((user) => new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length);
      setTotalProblems(problemsData.length);
      setNewProblems(problemsData.filter((problem) => new Date(problem.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length);
      setTotalTasks(tasksData.length);
      setNewTasks(tasksData.filter((task) => new Date(task.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length);
      setTotalRecoveries(recoveriesData.length);
      setNewRecoveries(recoveriesData.filter((recovery) => new Date(recovery.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length);

      setRecentProblems(problemsData.slice(0, 3).map((problem) => ({ name: problem.name, createdAt: problem.createdAt })));
      setRecentTasks(tasksData.slice(0, 3).map((task) => ({ name: task.name, createdAt: task.createdAt })));
      setRecentRecoveries(recoveriesData.slice(0, 3).map((recovery) => ({ name: recovery.name, createdAt: recovery.createdAt })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [user]);

  //chart option
  const chartOptions = {};
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users',
        data: [65, 78, 90, 115, 135, 158],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Problems',
        data: [45, 52, 68, 74, 90, 105],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const AdminContent = () => {
    return (
        <main className="admin-content">
          {activeLink === 'Dashboard' && (
            <div>
              <div className="widgets">
                <WidgetCard title="Total Users" count={totalUsers} />
                <WidgetCard title="New Users" count={newUsers} />
                <WidgetCard title="Total Problems" count={totalProblems} />
                <WidgetCard title="New Problems" count={newProblems} />
                <WidgetCard title="Total Tasks" count={totalTasks} />
                <WidgetCard title="New Tasks" count={newTasks} />
                <WidgetCard title="Total Recoveries" count={totalRecoveries} />
                <WidgetCard title="New Recoveries" count={newRecoveries} />
                </div>
                <div className="chart-container"><Line data={chartData} options={chartOptions} /></div>
                <div className="recent-list"><RecentList title="Recent Problems" items={recentProblems} /><RecentList title="Recent Tasks" items={recentTasks} /><RecentList title="Recent Recoveries" items={recentRecoveries} /></div>
            </div>
        )}
          <Outlet />
        </main>
    );
  }
      
  const homeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
  
  const usersIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
  
  const heartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  );
  
  const checkSquareIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  );
  
  const rocketIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
  );
  
  const barChartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  );
  
  const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
  
  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
  
  const trendingUpIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
  
  const userPlusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  );
  
  const fileTextIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
  
  const checkCircleIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
  
  const calendarIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
  
  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: homeIcon },
    { name: 'UsersManagement', icon: usersIcon },
    { name: 'Problems Management', icon: heartIcon },
    { name: 'Tasks Management', icon: checkSquareIcon },    
    { name: 'Recoveries Management', icon: rocketIcon },
    { name: 'Analytics', icon: barChartIcon }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>MINDCARE Admin Dashboard</h1>
      </header>
      
        <aside className="admin-sidebar">
        <nav>
        <ul>
          {navItems.map((item) => ( 
            <li key={item.name} className={activeLink === item.name ? 'active' : ''}>
              <Link
                to={item.name === 'Dashboard' ? '/admin' : `/admin/${item.name.toLowerCase().replace(/\s+/g, '')}`}
                onClick={() => setActiveLink(item.name)}
              > {item.name}
                {item.icon}
                
              </Link>
            </li>
            ))}
           
            <li>
                <button onClick={handleLogout}>Logout</button>
            </li>
            <button onClick={handleCreateClick}>Create</button>
            
          </ul>
            </nav>
         </aside>
     

    
      <Routes>
      <Route path="/" element={<AdminContent />}>
        
        <Route path="usersmanagement" element={<UsersManagement/>} />
        <Route path="users/create" element={<CreateUser/>} />        
        <Route path="problemsmanagement" element={<ProblemsManagement/>} />
        <Route path="problems/create" element={<CreateProblem/>} />
        <Route path="tasksmanagement" element={<TasksManagement/>} />
        <Route path="tasks/create" element={<CreateTask/>} />
        <Route path="recoveriesmanagement" element={<RecoveriesManagement/>} />
        <Route path="recoveries/create" element={<CreateRecovery/>} />
        <Route path="analytics" element={<Analytics/>} />        
        
        </Route>      </Routes>
      </div>
  );
};

const UsersManagement = () => { 
  return (
    <div >
      <h2>Users Management</h2>
      {/* Add your users management content here */}
    </div>
  );
};

const ProblemsManagement = () => {
  return (
    <div>
      <h2>Problems Management</h2>
      {/* Add your problems management content here */}
    </div>
  );
};

const TasksManagement = () => {
  return (
    <div>
      <h2>Tasks Management</h2>
      {/* Add your tasks management content here */}
    </div>
  );
};

const RecoveriesManagement = () => {
  return (
    <div>
      <h2>Recoveries Management</h2>
      {/* Add your recoveries management content here */}
    </div>
  );
};

const Analytics = () => {
  return (
    <div>
      <h2>Analytics</h2>
      {/* Add your analytics content here */}
    </div>
  );
};
const CreateUser = () => {
  return (
    <div>
      <h2>Create User</h2>
      {/* Add your Create User content here */}
    </div>
  );
};

const CreateProblem = () => {
  return (
    <div>
      <h2>Create Problem</h2>
      {/* Add your Create problem content here */}
    </div>
  );
};

const CreateTask = () => {
  return (
    <div>
      <h2>Create Task</h2>
      {/* Add your Create Task content here */}
    </div>
  );
};

const CreateRecovery = () => {
  return (
    <div>
      <h2>Create Recovery</h2>
      {/* Add your Create Recovery content here */}
    </div>
  );
};

export default AdminDashboard;