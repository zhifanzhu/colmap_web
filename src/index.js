import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
const hostname = window.location.hostname;
const subpath = 'colmap_projects/2022-12-17/P09_07-homo/'
// const subpath = 'colmap_projects/2023-01-10/P23_05-homo/'
fetch(`http://${hostname}:5001/model/${subpath}`).then(response => response.json())
  .then(model => {
    root.render(
      <React.StrictMode>
        <App model={model} />
      </React.StrictMode>
    );
  })