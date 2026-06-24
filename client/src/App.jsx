import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import RoutineDetail from './pages/RoutineDetail';
import Progress from './pages/Progress';
import AdminPanel from './pages/AdminPanel';
import CoachDashboard from './pages/CoachDashboard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
        <Route path="/routines" element={<PrivateRoute><Routines /></PrivateRoute>} />
        <Route path="/routines/:id" element={<PrivateRoute><RoutineDetail /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminPanel /></RoleRoute>} />
        <Route path="/coach" element={<RoleRoute roles={['admin', 'coach']}><CoachDashboard /></RoleRoute>} />
      </Routes>
    </div>
  );
}
