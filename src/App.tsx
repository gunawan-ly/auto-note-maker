import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LibraryPage } from './pages/LibraryPage';
import { EditorPage } from './pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/notebook/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
