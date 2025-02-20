
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from '@/router/routes';
import { Toaster } from '@/components/ui/toaster';
import Error from '@/pages/Error';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
              errorElement={<Error />}
            />
          ))}
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
