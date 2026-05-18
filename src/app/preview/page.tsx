import { redirect } from 'next/navigation';

// Compatibilidad: antes era la vista completa; ahora la home es esta landing.
export default function PreviewRedirectPage() {
  redirect('/');
}
