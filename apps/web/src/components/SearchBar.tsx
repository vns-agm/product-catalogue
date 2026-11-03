import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');

  // Keep the box in sync when the user navigates back/forward between searches.
  useEffect(() => setTerm(params.get('q') ?? ''), [params]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" className="search-bar" onSubmit={onSubmit}>
      <label htmlFor="search-input" className="visually-hidden">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        placeholder="Search products"
        value={term}
        maxLength={100}
        onChange={(event) => setTerm(event.target.value)}
      />
      <button type="submit" className="button" disabled={!term.trim()}>
        Search
      </button>
    </form>
  );
}
