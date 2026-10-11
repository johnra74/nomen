import { type ReactNode, useEffect, useId, useRef } from 'react';
import { type Route, hashOf } from '../routes';

interface PageProps {
  readonly title: string;
  /** Where the buttons at the foot of the page lead, with their labels. */
  readonly links: readonly {
    readonly to: Route;
    readonly label: string;
    readonly primary?: boolean;
  }[];
  readonly children: ReactNode;
}

/** Shared frame for the static pages: a titled card that takes focus when opened. */
export function Page({ title, links, children }: PageProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Moving focus to the title tells screen-reader users the page has changed.
  useEffect(() => titleRef.current?.focus(), []);

  return (
    <section className="page card" aria-labelledby={titleId}>
      <div className="card-body">
        <h2 id={titleId} ref={titleRef} tabIndex={-1} className="card-title h3">
          {title}
        </h2>
        {children}
        <div className="d-flex flex-wrap gap-2 mt-4">
          {links.map((link) => (
            <a
              key={link.to}
              className={`btn flex-fill d-flex align-items-center justify-content-center ${link.primary ? 'btn-primary btn-lg' : 'btn-secondary'}`}
              href={hashOf(link.to)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
