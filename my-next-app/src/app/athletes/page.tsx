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
    name: "Mira bhai chanu",
    sport: "Weightlifting",
    country: "India",
    avatarUrl: "https://i.pinimg.com/736x/41/81/ca/4181cafcc294ece24407b8c4bd624fd4.jpg",
    description:
      "Mira bhai chanu is a weightlifting athlete from India. She has won multiple medals at the Olympics and World Championships.",
    stats: [
      { label: "Weight", value: 80 },
      { label: "Height", value: 1.80 },
      { label: "Body Mass Index", value: "25.0" },
    ],
  },
  {
    id: "3",
    name: "SUNIL CHETTRI",
    sport: "Football",
    team: "Bengal Blaze",
    country: "India",
    avatarUrl: "https://i.pinimg.com/736x/7d/96/37/7d9637c5ba72fdcd41bc22e4ada9033a.jpg",
    description:
      "Sunil Chettri is a football player from India. He has won multiple awards and has been named the best player of the year in 2011.",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Goals", value: 57.3 },
      { label: "Assists", value: 93 },
    ],
  },
  {
    id: "4",
    name: "Ritu Rani",
    sport: "Hockey",
    team: "Delhi Dynamos",
    country: "India",
    avatarUrl: "https://i.pinimg.com/736x/be/7b/2b/be7b2b2846c5eaf277f6a0f52cd083d9.jpg",
    description:
      "Midfield engine with tireless work-rate, precise stick skills, and sharp distribution under pressure.",
    stats: [
      { label: "Caps", value: 61 },
      { label: "Assists", value: 21 },
      { label: "Goals", value: 9 },
    ],
  },
  {
    id: "5",
    name: "Nitesh Kumar",
    sport: "Kabbadi",
    country: "India",
    avatarUrl: "https://i.pinimg.com/736x/bf/e4/00/bfe40089af32452f22ca9fd4ca467caa.jpg",
    description:
      "Nitesh Kumar is a kabbadi player from India. He has won multiple awards and has been named the best player of the year in 2011.",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Goals", value: 57.3 },
      { label: "Assists", value: 93 },
    ],
  },
  {
    id: "6",
    name: "Sana Iqbal",
    sport: "Basketball",
    team: "Hyderabad Hawks",
    country: "India",
    avatarUrl: "https://i.pinimg.com/736x/28/bd/9c/28bd9c48a94a54bf043f910105b6b1b4.jpg",
    description:
      "Versatile wing with elite defensive instincts, transition speed, and a smooth catch-and-shoot three.",
    stats: [
      { label: "PPG", value: 18.4 },
      { label: "RPG", value: 7.1 },
      { label: "APG", value: 4.3 },
    ],
  },
  {
    id: "7",
    name: "PV Sindhu",
    sport: "Badminton",
    team: "India National Team",
    country: "India",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHNjYy0F76arindzdpqqLUdA1j5bqAC_O_5A&s",
    description:
      " Indian badminton player. Considered as one of India's most successful athletes, Sindhu has won medals at tournaments such as the Olympic Games, the World Championships",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Avg", value: 57.3 },
      { label: "SR", value: 93 },
    ],
  },

  {
    id: "8",
    name: "Priya Punia",
    sport: "Cricket",
    team: "India National Team",
    country: "India",
    avatarUrl:
      "https://i.pinimg.com/236x/6c/2d/bb/6c2dbb6c6c970a2617d9608824df5829.jpg",
    description:
      " Indian Cricket player. Considered as one of India's most successful athletes, Priya Punia has been actively participating in tournaments such as the Ranji Trophy, the World cup selections",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Avg", value: 57.3 },
      { label: "SR", value: 93 },
    ],
  },

  {
    id: "9",
    name: "Saina Nehwal",
    sport: "Badminton",
    team: "India National Team",
    country: "India",
    avatarUrl:
      "https://i.pinimg.com/originals/5f/f1/e9/5ff1e993c79941cada03b45f07b4e99a.jpg",
    description:
      " Indian badminton player. Considered as one of India's most successful athletes, Nehwal has won medals at tournaments such as the Olympic Games, the World Championships",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Avg", value: 57.3 },
      { label: "SR", value: 93 },
    ],
  },

  {
    id: "10",
    name: "Harmeet Desai",
    sport: "Table Tennis",
    team: "India National Team",
    country: "India",
    avatarUrl:
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS4EC8zGkIm2tew3JK8glUJfz-NyHvHXsiR9PZJV8ZyUdz3lEzt",
    description:
      "Harmeet Desai is an Indian table tennis player known for his offensive and aggressive playing style. Hailing from Surat, Gujarat, he has won multiple international medals and was honored with the Arjuna Award in 2019",
    stats: [
      { label: "Matches", value: 510 },
      { label: "Avg", value: 57.3 },
      { label: "SR", value: 93 },
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


