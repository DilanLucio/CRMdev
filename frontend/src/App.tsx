import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { NewProject } from './pages/NewProject';
import { EditProject } from './pages/EditProject';
import { ComingSoon } from './pages/ComingSoon';
import { Opportunities } from './pages/Opportunities';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Contacts } from './pages/Contacts';
import { ExClients } from './pages/ExClients';

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/leads" element={<ComingSoon title="Leads" />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/ex-clients" element={<ExClients />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
