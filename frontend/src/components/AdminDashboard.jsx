import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { getProblems, getRecoveries, getTasks, getUsers } from '../utils/api';
import './AdminDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WidgetCard = ({ title, count }) => (
  <div className="widget-card">
    <h3>{title}</h3>
    <p>{count}</p>
  </div>
);

const RecentItem = ({ item }) => (
  <li>
    <p>{item.name}</p>
    <p>Created at: {new Date(item.createdAt).toLocaleDateString()}</p>
  </li>
);

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
      case 'Users': return navigate('/admin/users/create');
      case 'Problems': return navigate('/admin/problems/create');
      case 'Tasks': return navigate('/admin/tasks/create');
      case 'Recoveries': return navigate('/admin/recoveries/create');
    }
    localStorage.removeItem('authToken');
    navigate('/login');
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

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'User Growth',
        data: [10, 15, 20, 30],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const AdminContent = () => {
    return (
      <main className="admin-content">
        {activeLink === 'Dashboard' && (
          <>
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
            <div className="chart-container">
              <Line data={data} options={chartOptions} />
            </div>
            <div className="recent-list">
              <RecentList title="Recent Problems" items={recentProblems} />
              <RecentList title="Recent Tasks" items={recentTasks} />
              <RecentList title="Recent Recoveries" items={recentRecoveries} />
            </div>
          </>
        )}
        <Outlet />
      </main>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>MINDCARE Admin Dashboard</h1>
      </header>
      <aside className="admin-sidebar">
        <nav>
          <ul>
            <li className={activeLink === 'Dashboard' ? 'active' : ''}>
              <Link to="/admin" onClick={() => setActiveLink('Dashboard')}>
                Dashboard
              </Link>
            </li>
            <li className={activeLink === 'Users' ? 'active' : ''}>
              <Link to="/admin/users" onClick={() => setActiveLink('Users')}>
                Users Management
              </Link>
            </li>
            <li className={activeLink === 'Problems' ? 'active' : ''}>
              <Link to="/admin/problems" onClick={() => setActiveLink('Problems')}>
                Problems Management
              </Link>
            </li>
            <li className={activeLink === 'Tasks' ? 'active' : ''}>
              <Link to="/admin/tasks" onClick={() => setActiveLink('Tasks')}>
                Tasks Management
              </Link>
            </li>
            <li className={activeLink === 'Recoveries' ? 'active' : ''}>
              <Link to="/admin/recoveries" onClick={() => setActiveLink('Recoveries')}>
                Recoveries Management
              </Link>
            </li>
            <li className={activeLink === 'Analytics' ? 'active' : ''}>
              <Link to="/admin/analytics" onClick={() => setActiveLink('Analytics')}>
                Analytics
              </Link>
            </li>
            <li>
                <button onClick={handleLogout}>Logout</button>
            </li>
            <button onClick={handleCreateClick}>Create</button>
          </ul>
        </nav>
      </aside>
      <Routes>
      <Route path="/" element={<AdminContent />}>
        <Route path="users" element={<UsersManagement />} />
        <Route path="users/create" element={<CreateUser />} />
        <Route path="problems" element={<ProblemsManagement />} />
        <Route path="problems/create" element={<CreateProblem />} />
        <Route path="tasks" element={<TasksManagement />} />
        <Route path="tasks/create" element={<CreateTask />} />
        <Route path="recoveries" element={<RecoveriesManagement />} />
        <Route path="recoveries/create" element={<CreateRecovery />} />
        <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </div>
  );
};

const RecentList = ({ title, items }) => (
  <div className="recent-section">
    <h2>{title}</h2>
    <ul>
      {items.map((item, index) => (
        <RecentItem key={index} item={item} />
      ))}
    </ul>
  </div>
);


const UsersManagement = () => {
  return (
    <div>
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