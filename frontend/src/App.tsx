import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { DealsPage } from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals/:ownerId" element={<DealsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
