import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import MateriaPrima from './pages/MateriaPrima';
import Produccion from './pages/Produccion';
import Ventas from './pages/Ventas';
import Header  from './components/Header';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 
  return (
    <Router>
      <div className="App d-flex">
        
        <Sidebar isCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main 
          className="flex-grow-1 transition-all"
          style={{
            marginLeft: sidebarCollapsed ? '70px' : '250px',
            transition: 'margin-left 0.3s ease',
            minHeight: '100vh'
          }}
        >
     <Header />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/materia-prima" element={<MateriaPrima />} />
              <Route path="/produccion" element={<Produccion />} />
              <Route path="/ventas" element={<Ventas />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
