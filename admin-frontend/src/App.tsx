import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResourcePage, { resources } from "./pages/ResourcePage";
import CompanyInfoPage from "./pages/CompanyInfoPage";
import LeadsPage from "./pages/LeadsPage";
import UsersPage from "./pages/UsersPage";
import MediaPage from "./pages/MediaPage";

function Protected({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="company-info" element={<CompanyInfoPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="users" element={<UsersPage />} />
        {resources.map((r) => (
          <Route key={r.path} path={r.path} element={<ResourcePage resource={r} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
