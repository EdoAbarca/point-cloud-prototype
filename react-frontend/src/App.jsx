import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainView from "./views/MainView";
import PointsView from "./views/PointsView";
import MeshView from "./views/MeshView";
import CreateMeshView from "./views/CreateMeshView";
import RegisterView from "./views/RegisterView";
import LoginView from "./views/LoginView";
import Health from "./views/Health";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/health" element={<Health />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/points" element={<PointsView />} />
          <Route path="/mesh/:id" element={<MeshView />} />
          <Route path="/create-mesh" element={<CreateMeshView />} />
        </Routes>
      </div>
    </Router>
  );
}
