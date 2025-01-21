import PointCloudViewer from './views/PointCloudViewer';

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Point Cloud Viewer</h1>
      <PointCloudViewer />
    </div>
  );
};

export default App;