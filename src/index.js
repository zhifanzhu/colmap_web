import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './index.css';
import App from './App';
import Registration from './Registration';
import FixedLine from './FixedLine';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route exact path="/" element={<App />} ></Route>
        <Route path="/registration" element={<Registration/>} ></Route>
        <Route path="/fixedline" element={<FixedLine/>} ></Route>
      </Routes>
    </Router>
    {/* <App /> */}
  </React.StrictMode>
);