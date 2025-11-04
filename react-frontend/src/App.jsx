import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { MainView } from "./views/MainView";
//import { PointsView } from "./views/PointsView";
//import { MeshesView } from "./views/MeshesView";
//import { CreateMeshView } from "./views/CreateMeshView";
import Health from "./views/Health";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <Routes>
          <Route path="/" element={<Health />} />
          {/** 
          <Route path="/" element={<MainView />} />
          <Route path="/points" element={<PointsView />} />
          <Route path="/meshes" element={<MeshesView />} />
          <Route path="/create-mesh" element={<CreateMeshView />} />*/}
        </Routes>
      </div>
    </Router>
  );
}
