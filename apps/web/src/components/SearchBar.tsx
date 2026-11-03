import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box in sync when the user navigates back/forward between searches.
  useEffect(() => setTerm(params.get('q') ?? ''), [params]);

  // Press "/" anywhere (outside a text field) to jump to search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== '/' || target.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      inputRef.current?.blur();
    }
  }

  return (
    <form role="search" className="search-bar" onSubmit={onSubmit}>
      <div className="search-bar__field">
        <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
          />
        </svg>
        <label htmlFor="search-input" className="visually-hidden">
          Search products
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder="Search products"
          value={term}
          maxLength={100}
          autoComplete="off"
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setTerm('')}
        />
        {term ? (
          <button
            type="button"
            className="search-bar__clear"
            aria-label="Clear search"
            onClick={() => {
              setTerm('');
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        ) : (
          <kbd className="search-bar__hint" aria-hidden="true">
            /
          </kbd>
        )}
      </div>
      <button type="submit" className="button" disabled={!term.trim()}>
        Search
      </button>
    </form>
  );
}
