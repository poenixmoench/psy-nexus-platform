import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => <h1>Frontend läuft! Verbunden mit Backend-API.</h1>;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
