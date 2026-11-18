import { formatKm, formatPrice } from "./site";

export type CarSeoInput = {
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  mileage_km?: number | null;
  fuel?: string | null;
  gearbox?: string | null;
  power_hp?: number | null;
  price: number | string;
  currency?: string | null;
  status?: string | null;
};

/** Per-car questions buyers actually search ("<model> <an> pret", "in rate", "livrare"). */
export function carFaq(car: CarSeoInput) {
  const name = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} ${car.year}`;
  const price = formatPrice(Number(car.price), car.currency ?? "EUR");
  const sold = car.status === "vanduta";
  return [
    {
      q: `Cât costă ${name}?`,
      a: sold
        ? `${name} a fost vândută la ${price}. Scrie-ne pe WhatsApp și îți căutăm o mașină similară din Germania.`
        : `Prețul este ${price}, negociabil la vizionare. Poți plăti cash sau în rate (credit auto ori leasing).`,
    },
    {
      q: `Câți kilometri are ${car.make} ${car.model}?`,
      a: `${name} are ${formatKm(car.mileage_km)}${car.fuel ? `, motor ${car.fuel}` : ""}${car.gearbox ? `, cutie ${car.gearbox}` : ""}${car.power_hp ? ` și ${car.power_hp} CP` : ""}. Istoricul și actele sunt verificate înainte de vânzare.`,
    },
    {
      q: `Pot cumpăra ${car.make} ${car.model} în rate?`,
      a: `Da. Calculează rata pe pagină, apoi îți facem oferta de finanțare cu avans de la 0% în funcție de eligibilitate.`,
    },
    {
      q: `Unde pot vedea mașina și livrați în altă localitate?`,
      a: `Mașina e la Bremen Auto, DN1 Luna de Sus (Florești), lângă Cluj-Napoca, deschis non-stop. Livrăm în toată România.`,
    },
  ];
}
