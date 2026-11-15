import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { carWhatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  carSlug: string;
  /** Numele mașinii, folosit doar pentru eticheta de accesibilitate. */
  title?: string;
  /** Textul butonului. */
  label?: string;
  /** Rând opțional pus după linkul anunțului. */
  message?: string;
  size?: "default" | "sm" | "lg";
  /** Umple lățimea disponibilă. */
  block?: boolean;
  className?: string;
};

/** Buton de contact WhatsApp pentru un anunț: deschide conversația cu linkul mașinii deja scris. */
export function WhatsAppButton({
  carSlug,
  title,
  label = "Scrie pe WhatsApp",
  message = "",
  size = "default",
  block = false,
  className,
}: Props) {
  return (
    <Button
      asChild
      variant="whatsapp"
      size={size}
      className={cn(block && "w-full", className)}
    >
      <a
        href={carWhatsappUrl(carSlug, message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title ? `Scrie pe WhatsApp despre ${title}` : label}
      >
        <MessageCircle className="size-4" /> {label}
      </a>
    </Button>
  );
}
