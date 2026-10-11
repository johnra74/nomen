import type { PersonalBest } from '../../domain/types';

export function BestScore({ best }: { readonly best: PersonalBest | null }) {
  if (best === null) return null;
  return (
    <p className="best text-center mb-0">
      Personal best: <strong>{best.score}</strong> (level {best.level})
    </p>
  );
}
