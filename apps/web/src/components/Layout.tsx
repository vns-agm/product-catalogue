import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
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
            <span className="brand__mark" aria-hidden="true">
              ✦
            </span>
            Catalogue
          </Link>
          <SearchBar />
        </div>
        <nav aria-label="Categories" className="container category-nav">
          {categories.status === 'success' && (
            <ul>
              {categories.data.categories.map((category) => (
                <li key={category.slug}>
                  <NavLink to={`/categories/${category.slug}`} className="chip">
                    {category.name}
                  </NavLink>
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
        <div className="container">
          <span>Proof of concept · product data from Fake Store API</span>
          <span>Prices in USD</span>
        </div>
      </footer>
      <BackToTop />
      <ScrollRestoration />
    </>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      ↑
    </button>
  );
}
