import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { Icon } from './Icon';
import { SearchBar } from './SearchBar';

export function Layout() {
  const categories = useApi(() => api.categories(), []);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPast(8);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  // Support in-page links such as /#story once the page has rendered.
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(timer);
  }, [location]);

  const categoryList = categories.status === 'success' ? categories.data.categories : [];

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <p className="announcement">Personal replies to every enquiry, within one business day</p>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container site-header__bar">
          <div className="site-header__start">
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
            <Wordmark />
          </div>

          <nav aria-label="Categories" className="nav-links">
            <ul>
              {categoryList.map((category) => (
                <li key={category.slug}>
                  <NavLink to={`/categories/${category.slug}`} className="nav-link">
                    {category.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <SearchBar />
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Menu" className="mobile-menu">
            <ul className="container">
              <li>
                <NavLink to="/" end>
                  Home <Icon name="arrowRight" />
                </NavLink>
              </li>
              {categoryList.map((category) => (
                <li key={category.slug}>
                  <NavLink to={`/categories/${category.slug}`}>
                    {category.name} <Icon name="arrowRight" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Keyed by path so each page gets a soft entrance transition. */}
      <main id="main" key={location.pathname} className="page">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__grid">
          <div className="site-footer__brand">
            <Wordmark />
            <p className="site-footer__about">
              A curated catalogue of clothing, jewellery and technology, chosen for quality and longevity.
              Every enquiry is answered personally.
            </p>
          </div>
          <nav aria-label="Shop">
            <h2>Shop</h2>
            <ul>
              {categoryList.map((category) => (
                <li key={category.slug}>
                  <Link to={`/categories/${category.slug}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>Service</h2>
            <ul>
              <li>Product enquiries</li>
              <li>Replies within one business day</li>
              <li>Prices shown in USD</li>
            </ul>
          </div>
          <nav aria-label="About">
            <h2>About</h2>
            <ul>
              <li>
                <Link to="/#story">Our approach</Link>
              </li>
              <li>
                <Link to="/#top-rated">Top rated</Link>
              </li>
              <li>
                <Link to="/#categories">Shop by category</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="container site-footer__bottom">
          <span>© {new Date().getFullYear()} Catalogue. Proof of concept.</span>
          <span>Product data from the Fake Store API</span>
        </div>
      </footer>

      <BackToTop />
      <ScrollRestoration />
    </>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Catalogue, home">
      <span className="wordmark__name">Catalogue</span>
      <span className="wordmark__tag">Curated goods</span>
    </Link>
  );
}

function useScrolledPast(offset: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return past;
}

function BackToTop() {
  const visible = useScrolledPast(900);
  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="arrowUp" />
    </button>
  );
}
