import Firmas from "@/components/Firmas";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Firmas",
  description: "Bristol production company signatures and brand assets.",
  path: "/firmas/",
});

export default function FirmasP() {
    return(
        <div className="bg-white">
            <Firmas/>

        </div>
    )
}