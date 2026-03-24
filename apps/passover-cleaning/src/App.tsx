import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import FamilyPage from './pages/FamilyPage';
import GuidePage from './pages/GuidePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
