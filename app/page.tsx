import CardView from "@/components/Card";
import { getCardByCounter } from "@/lib/cards";
import { nextCounter } from "@/lib/redis";

// Every scan must re-run so each visitor gets a fresh card — never cached.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const counter = await nextCounter();
  const { card, serial } = getCardByCounter(counter);

  return <CardView card={card} serial={serial} />;
}
