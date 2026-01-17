import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { HomePage } from './pages/HomePage';
import { DealsPage } from './pages/DealsPage';
import { IncentivesPage } from './pages/IncentivesPage';
import { EarningsPage } from './pages/EarningsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals/:ownerId" element={<DealsPage />} />
        <Route path="/incentives/:orgId" element={<IncentivesPage />} />
        <Route path="/earnings/:orgId" element={<EarningsPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
