import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,

    children: [
      {
        path: 'home/*',
        async lazy() {
          const Component = await import('../pages/home');
          return { Component: Component.default };
        },
      },
      {
        path: 'other/*',
        async lazy() {
          const Component = await import('../pages/other');
          return { Component: Component.default };
        },
      },
    ],
  },
]);
