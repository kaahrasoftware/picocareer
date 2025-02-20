
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import { routes } from '@/router/routes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const content = useRoutes(routes);

  return (
    <BrowserRouter>
      <div className="app">
        {content}
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
