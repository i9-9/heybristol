import { getDirectors, getVideosAsVideoItems } from "@/lib/directors-api";
import GridTestClient from "@/app/gridtest/GridTestClient";

// Configurar ISR - se regenera cada hora o cuando hay cambios
export const revalidate = 3600; // 1 hora

export default async function GridTestPage() {
  // Obtener todos los directores y usar el primero disponible
  const directors = await getDirectors();
  
  if (!directors || directors.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>No hay directores disponibles para pruebas</p>
      </div>
    );
  }

  // Usar el primer director (Lemon según el orden)
  const director = directors[0];
  const videos = await getVideosAsVideoItems(director.name);

  return <GridTestClient director={director} videos={videos} />;
}

