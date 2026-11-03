import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from './Icon';

export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box in sync when the user navigates back/forward between searches.
  useEffect(() => setTerm(params.get('q') ?? ''), [params]);

  // Press "/" anywhere outside a text field to jump to search.
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
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    inputRef.current?.blur();
  }

  return (
    <form role="search" className="search-bar" onSubmit={onSubmit}>
      <div className="search-bar__field">
        <Icon name="search" size={17} className="search-bar__icon" />
        <label htmlFor="search-input" className="visually-hidden">
          Search products
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder="Search the catalogue"
          value={term}
          maxLength={100}
          autoComplete="off"
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setTerm('')}
        />
        {term && (
          <button
            type="button"
            className="search-bar__clear"
            aria-label="Clear search"
            onClick={() => {
              setTerm('');
              inputRef.current?.focus();
            }}
          >
            <Icon name="close" size={15} />
          </button>
        )}
      </div>
      <button type="submit" className="button" disabled={!term.trim()}>
        Search
      </button>
    </form>
  );
}
