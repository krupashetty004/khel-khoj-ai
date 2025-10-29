import PlayerCard, { Player } from "@/components/PlayerCard";

const sampleAthletes: Player[] = [
  {
    id: "1",
    name: "Aarav Patel",
    sport: "Cricket",
    team: "Mumbai Mavericks",
    country: "India",
    stats: [
      { label: "Matches", value: 72 },
      { label: "Avg", value: 48.2 },
      { label: "SR", value: 136 },
    ],
  },
  {
    id: "2",
    name: "Mira Khan",
    sport: "Badminton",
    country: "India",
    stats: [
      { label: "Titles", value: 8 },
      { label: "Rank", value: 6 },
      { label: "Win%", value: "68%" },
    ],
  },
  {
    id: "3",
    name: "Kabir Singh",
    sport: "Football",
    team: "Bengal Blaze",
    country: "India",
    stats: [
      { label: "Apps", value: 54 },
      { label: "Goals", value: 19 },
      { label: "Assists", value: 12 },
    ],
  },
];

export default function AthletesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Athletes
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Explore players across sports. Click a card to select.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sampleAthletes.map((athlete) => (
          <PlayerCard key={athlete.id} player={athlete} />
        ))}
      </section>
    </main>
  );
}


