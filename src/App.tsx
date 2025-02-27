// src/App.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function App() {
  return (
    <div> 
      <Outlet />
    </div>
  );
}

export default App;
