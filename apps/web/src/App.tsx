import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, type RouteObject, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageSkeleton } from './components/Skeleton';
import { HomePage } from './pages/HomePage';

// The home page ships in the main bundle; every other page is code-split and
// downloaded the first time it is visited.
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const page = (Page: ComponentType) => (
  <Suspense fallback={<PageSkeleton />}>
    <Page />
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/categories/:slug', element: page(CategoryPage) },
      { path: '/search', element: page(SearchPage) },
      { path: '/products/:id', element: page(ProductPage) },
      { path: '*', element: page(NotFoundPage) },
    ],
  },
];

const router = createBrowserRouter(routes);

export function App() {
  return <RouterProvider router={router} />;
}
