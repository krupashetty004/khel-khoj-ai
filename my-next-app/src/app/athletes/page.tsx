import PlayerCard, { Player } from "@/components/PlayerCard";

const sampleAthletes: Player[] = [
  {
    id: "1",
    name: "Virat Kohli",
    sport: "Cricket",
    team: "India National Team",
    country: "India",
    avatarUrl:
      "https://i.pinimg.com/736x/27/59/2a/27592a992de78e5c39c678a78c34cce3.jpg",
    description:
      "Renowned for his sharp focus and precise timing, Virat displays exceptional batting consistency and leadership on the field.",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Avg", value: 57.3 },
      { label: "SR", value: 93 },
    ],
  },
  {
    id: "2",
    name: "Mira Khan",
    sport: "Badminton",
    country: "India",
    avatarUrl:
      "https://images.unsplash.com/photo-1521417531039-94d1d6e25086?q=80&w=800&auto=format&fit=crop",
    description:
      "An agile shuttler with explosive footwork and control at the net, Mira thrives in high-tempo rallies.",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop",
    description:
      "A creative forward known for his link-up play, off-the-ball movement, and clutch finishing in the box.",
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


