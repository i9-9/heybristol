/**
 * Clave para ordenar directores alfabéticamente por **apellido**.
 * Usa la última palabra del nombre (maneja "Pietro Biz Biasia" → Biasia, "Los Chacón" → Chacón).
 * Nombre de una sola palabra (Thor, Tigre) se usa entera.
 */
export function directorSurnameSortKey(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts.length === 1 ? parts[0]! : parts[parts.length - 1]!;
}

export function compareDirectorsBySurname(
  a: { name: string },
  b: { name: string }
): number {
  const cmp = directorSurnameSortKey(a.name).localeCompare(
    directorSurnameSortKey(b.name),
    'es',
    { sensitivity: 'base' }
  );
  if (cmp !== 0) return cmp;
  return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
}
