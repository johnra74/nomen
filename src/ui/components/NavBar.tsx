import { ROUTES, type Route } from '../routes';

export function NavBar({ route }: { readonly route: Route }) {
  return (
    <header className="app-bar navbar bg-primary">
      <div className="container flex-nowrap">
        <h1 className="wordmark text-white m-0">nōmən</h1>
        <nav className="nav flex-nowrap" aria-label="Pages">
          {ROUTES.map((entry) => (
            <a
              key={entry.route}
              className="nav-link"
              href={entry.hash}
              aria-current={entry.route === route ? 'page' : undefined}
            >
              {entry.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
