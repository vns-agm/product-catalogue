import { Link, NavLink, Outlet } from 'react-router-dom';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { SearchBar } from './SearchBar';

export function Layout() {
  const categories = useApi(() => api.categories(), []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            Catalogue
          </Link>
          <SearchBar />
        </div>
        <nav aria-label="Categories" className="container category-nav">
          {categories.status === 'success' && (
            <ul>
              {categories.data.categories.map((category) => (
                <li key={category.slug}>
                  <NavLink to={`/categories/${category.slug}`}>{category.name}</NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </header>
      <main id="main" className="container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">Proof of concept · product data from Fake Store API</div>
      </footer>
    </>
  );
}
