import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { DealsPage } from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/deals/:ownerId" element={<DealsPage />} />
        <Route path="*" element={<Navigate to="/deals/placeholder" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
