import { getDirectorBySlug } from "@/data/directors";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export default function DirectorPage({ params }: Props) {
  const director = getDirectorBySlug(params.slug);
  
  if (!director) {
    notFound();
  }

  return (
    <div>
      {/* Aquí puedes implementar tu propio diseño */}
      <h1>{director.name}</h1>
      <p>Slug: {params.slug}</p>
    </div>
  );
}


