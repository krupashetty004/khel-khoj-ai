// Shared athlete data with IDs for routing
export interface Athlete {
  id: string;
  playerName: string;
  sport: string;
  imageUrl: string;
  team: string;
  country: string;
  position: string;
  age: number;
  height: string;
  weight: string;
  experience: string;
  stats: { label: string; value: string | number }[];
  bio: string;
  achievements: string[];
  scoutingReport: {
    overall: number;
    strengths: string[];
    areasToImprove: string[];
    potential: "Elite" | "High" | "Moderate" | "Developing";
    physicalAttributes: {
      speed: number;
      agility: number;
      endurance: number;
      strength: number;
      flexibility: number;
    };
    technicalSkills: {
      name: string;
      rating: number;
    }[];
    mentalAttributes: {
      focus: number;
      composure: number;
      leadership: number;
      workEthic: number;
    };
    narrative: string;
    recommendations: string[];
  };
}

export const fictionalAthletes: Athlete[] = [
  {
    id: "arjun-sharma",
    playerName: "Arjun Sharma",
    sport: "Cricket",
    imageUrl: "",
    team: "Mumbai Indians Academy",
    country: "India",
    position: "All-rounder",
    age: 19,
    height: "5'11\" (180 cm)",
    weight: "75 kg",
    experience: "5 years",
    stats: [
      { label: "Runs", value: "2,450" },
      { label: "Wickets", value: "78" },
      { label: "Avg", value: "42.5" },
    ],
    bio: "Arjun Sharma is a dynamic all-rounder from Mumbai who has been making waves in domestic cricket. Known for his aggressive batting style and clever medium-pace bowling, he has been a consistent performer in the Ranji Trophy and IPL youth leagues.",
    achievements: [
      "U-19 World Cup Squad Member 2025",
      "Ranji Trophy Best All-rounder 2024",
      "IPL Youth League Top Scorer 2024",
      "Mumbai Cricket Association Young Talent Award",
    ],
    scoutingReport: {
      overall: 82,
      strengths: [
        "Exceptional batting technique against pace",
        "Versatile bowling with good variations",
        "Strong fielder with quick reflexes",
        "Natural match-winner mentality",
      ],
      areasToImprove: [
        "Spin bowling needs more consistency",
        "Shot selection under pressure",
        "Fitness for longer format games",
      ],
      potential: "High",
      physicalAttributes: {
        speed: 78,
        agility: 82,
        endurance: 75,
        strength: 80,
        flexibility: 76,
      },
      technicalSkills: [
        { name: "Batting", rating: 85 },
        { name: "Bowling", rating: 78 },
        { name: "Fielding", rating: 82 },
        { name: "Wicketkeeping", rating: 65 },
      ],
      mentalAttributes: {
        focus: 80,
        composure: 75,
        leadership: 78,
        workEthic: 88,
      },
      narrative: "Arjun demonstrates the rare combination of batting flair and bowling intelligence that defines modern all-rounders. His ability to accelerate scoring in death overs while maintaining control with the ball makes him a valuable T20 asset. With continued development, particularly in spin handling and fitness, he has the tools to become a mainstay in professional cricket.",
      recommendations: [
        "Focus on improving stamina for Test cricket demands",
        "Work with spin bowling coach on variations",
        "Mental conditioning for high-pressure situations",
        "Consider leadership roles in youth teams",
      ],
    },
  },
  {
    id: "priya-verma",
    playerName: "Priya Verma",
    sport: "Athletics",
    imageUrl: "",
    team: "National Sports Academy",
    country: "India",
    position: "Sprinter",
    age: 21,
    height: "5'7\" (170 cm)",
    weight: "58 kg",
    experience: "8 years",
    stats: [
      { label: "100m", value: "11.2s" },
      { label: "200m", value: "23.8s" },
      { label: "Medals", value: "15" },
    ],
    bio: "Priya Verma is one of India's most promising sprinters, having broken multiple national junior records. Her explosive start and powerful stride have earned her recognition on the international stage, including appearances at the Asian Games.",
    achievements: [
      "Asian Games Bronze Medal 2024",
      "National Champion 100m & 200m 2024",
      "Junior National Record Holder",
      "Sports Authority of India Scholar",
    ],
    scoutingReport: {
      overall: 88,
      strengths: [
        "Exceptional reaction time off blocks",
        "Powerful drive phase technique",
        "Mental resilience in finals",
        "Consistent performance under pressure",
      ],
      areasToImprove: [
        "Transition phase efficiency",
        "Top-end speed maintenance",
        "Recovery time between heats",
      ],
      potential: "Elite",
      physicalAttributes: {
        speed: 92,
        agility: 85,
        endurance: 78,
        strength: 82,
        flexibility: 88,
      },
      technicalSkills: [
        { name: "Block Start", rating: 90 },
        { name: "Drive Phase", rating: 88 },
        { name: "Top Speed", rating: 85 },
        { name: "Finish", rating: 82 },
      ],
      mentalAttributes: {
        focus: 90,
        composure: 85,
        leadership: 75,
        workEthic: 92,
      },
      narrative: "Priya possesses the rare combination of explosive power and technical precision that separates elite sprinters. Her 0.12s reaction time is among the best in Asia, and her drive phase biomechanics are textbook. With targeted work on maintaining top-end speed through the line, she has genuine Olympic medal potential.",
      recommendations: [
        "Altitude training camp before major championships",
        "Biomechanical analysis of late-race deceleration",
        "Strength program focused on posterior chain",
        "Sports psychology for championship mindset",
      ],
    },
  },
  {
    id: "rahul-patel",
    playerName: "Rahul Patel",
    sport: "Football",
    imageUrl: "",
    team: "Bengaluru FC Youth",
    country: "India",
    position: "Midfielder",
    age: 20,
    height: "5'9\" (175 cm)",
    weight: "70 kg",
    experience: "7 years",
    stats: [
      { label: "Goals", value: "28" },
      { label: "Assists", value: "45" },
      { label: "Matches", value: "120" },
    ],
    bio: "Rahul Patel is a creative midfielder who has risen through the ranks of Indian football academies. His vision, passing range, and ability to dictate tempo have made him a standout in the I-League youth division.",
    achievements: [
      "I-League Youth Best Midfielder 2024",
      "U-20 National Team Captain",
      "Bengaluru FC Academy Player of the Year",
      "Durand Cup Youth Champion 2023",
    ],
    scoutingReport: {
      overall: 79,
      strengths: [
        "Exceptional passing accuracy and range",
        "Excellent spatial awareness",
        "Strong set-piece delivery",
        "High football IQ and reading of play",
      ],
      areasToImprove: [
        "Defensive positioning",
        "Physical duels and aerial ability",
        "Pace over long distances",
      ],
      potential: "High",
      physicalAttributes: {
        speed: 72,
        agility: 80,
        endurance: 82,
        strength: 68,
        flexibility: 75,
      },
      technicalSkills: [
        { name: "Passing", rating: 88 },
        { name: "Vision", rating: 85 },
        { name: "Dribbling", rating: 78 },
        { name: "Shooting", rating: 75 },
      ],
      mentalAttributes: {
        focus: 85,
        composure: 88,
        leadership: 82,
        workEthic: 80,
      },
      narrative: "Rahul is a cerebral midfielder who controls games through intelligent positioning and precise distribution. His ability to find pockets of space and execute difficult passes under pressure is reminiscent of classic playmakers. Improving his physical robustness will be key to competing at higher levels.",
      recommendations: [
        "Strength and conditioning program for physical duels",
        "Work on defensive awareness and tracking runs",
        "Study European league midfielders for tactical insight",
        "Continue developing leadership qualities",
      ],
    },
  },
  {
    id: "ananya-krishnan",
    playerName: "Ananya Krishnan",
    sport: "Badminton",
    imageUrl: "",
    team: "Gopichand Academy",
    country: "India",
    position: "Singles",
    age: 18,
    height: "5'6\" (168 cm)",
    weight: "55 kg",
    experience: "10 years",
    stats: [
      { label: "Titles", value: "12" },
      { label: "Ranking", value: "#24" },
      { label: "Win %", value: "78%" },
    ],
    bio: "Ananya Krishnan is a prodigious badminton talent who has been training at the prestigious Gopichand Academy since age 8. Her aggressive playing style and exceptional court coverage have earned her recognition as one of India's brightest prospects.",
    achievements: [
      "World Junior Championships Silver 2024",
      "BWF Super 100 Champion 2024",
      "National Junior Champion (3x)",
      "Junior Syed Modi International Winner",
    ],
    scoutingReport: {
      overall: 84,
      strengths: [
        "Lightning-fast court coverage",
        "Devastating smash accuracy",
        "Excellent deception in net play",
        "Strong mental fortitude in deciders",
      ],
      areasToImprove: [
        "Defensive returns against power players",
        "Pacing in three-game matches",
        "Variety in attacking patterns",
      ],
      potential: "Elite",
      physicalAttributes: {
        speed: 90,
        agility: 92,
        endurance: 80,
        strength: 75,
        flexibility: 88,
      },
      technicalSkills: [
        { name: "Smash", rating: 88 },
        { name: "Net Play", rating: 85 },
        { name: "Defense", rating: 78 },
        { name: "Drop Shots", rating: 82 },
      ],
      mentalAttributes: {
        focus: 88,
        composure: 82,
        leadership: 70,
        workEthic: 90,
      },
      narrative: "Ananya combines exceptional athleticism with tactical intelligence beyond her years. Her ability to dominate rallies through aggressive shot selection while maintaining impressive consistency marks her as a future world-class player. Continued development of her defensive game will make her a complete player.",
      recommendations: [
        "Specialized training for defensive returns",
        "Tactical variations against different playing styles",
        "Physical conditioning for longer matches",
        "Exposure to senior international tournaments",
      ],
    },
  },
  {
    id: "vikram-singh",
    playerName: "Vikram Singh",
    sport: "Hockey",
    imageUrl: "",
    team: "Punjab Hockey Club",
    country: "India",
    position: "Forward",
    age: 22,
    height: "5'10\" (178 cm)",
    weight: "72 kg",
    experience: "9 years",
    stats: [
      { label: "Goals", value: "56" },
      { label: "Caps", value: "45" },
      { label: "POMs", value: "12" },
    ],
    bio: "Vikram Singh comes from a family of hockey players in Punjab and has inherited the natural stick skills and game sense that run in his lineage. His pace, finishing ability, and work rate have made him a key player for the national junior team.",
    achievements: [
      "Junior Hockey World Cup Bronze 2023",
      "Hockey India League Top Scorer 2024",
      "Senior National Team Call-up 2024",
      "Punjab State Best Forward Award",
    ],
    scoutingReport: {
      overall: 81,
      strengths: [
        "Clinical finishing in the circle",
        "Excellent off-the-ball movement",
        "Strong pressing and work rate",
        "Good aerial control and first touch",
      ],
      areasToImprove: [
        "Penalty corner conversion",
        "Consistency in big matches",
        "Defensive contribution in counter-attacks",
      ],
      potential: "High",
      physicalAttributes: {
        speed: 85,
        agility: 82,
        endurance: 80,
        strength: 78,
        flexibility: 75,
      },
      technicalSkills: [
        { name: "Finishing", rating: 86 },
        { name: "Dribbling", rating: 82 },
        { name: "Passing", rating: 78 },
        { name: "Penalty Corners", rating: 72 },
      ],
      mentalAttributes: {
        focus: 78,
        composure: 75,
        leadership: 72,
        workEthic: 85,
      },
      narrative: "Vikram is a natural goal scorer with the instincts and movement that cannot be taught. His ability to find space in crowded circles and finish with composure makes him a valuable attacking asset. Developing his penalty corner skills and big-game temperament will elevate him to the senior national team permanently.",
      recommendations: [
        "Intensive penalty corner training program",
        "Mental conditioning for high-pressure matches",
        "Video analysis of top international forwards",
        "Work on two-way play and defensive positioning",
      ],
    },
  },
  {
    id: "meera-nair",
    playerName: "Meera Nair",
    sport: "Swimming",
    imageUrl: "",
    team: "Kerala Aquatics",
    country: "India",
    position: "Freestyle",
    age: 17,
    height: "5'8\" (173 cm)",
    weight: "62 kg",
    experience: "8 years",
    stats: [
      { label: "Golds", value: "8" },
      { label: "Records", value: "3" },
      { label: "Events", value: "45" },
    ],
    bio: "Meera Nair discovered her love for swimming in the backwaters of Kerala and has since become one of India's most promising aquatic talents. Her natural feel for water and efficient stroke mechanics have set multiple national age-group records.",
    achievements: [
      "National Games Gold Medalist 2024",
      "Asian Age Group Championships Silver 2024",
      "National Junior Record Holder 200m Freestyle",
      "Kerala State Best Swimmer Award",
    ],
    scoutingReport: {
      overall: 85,
      strengths: [
        "Exceptional stroke efficiency",
        "Powerful underwater dolphin kicks",
        "Strong pacing and race strategy",
        "Natural water feel and body position",
      ],
      areasToImprove: [
        "Turn technique and push-off",
        "Final 50m sprint",
        "Open water adaptability",
      ],
      potential: "Elite",
      physicalAttributes: {
        speed: 86,
        agility: 80,
        endurance: 88,
        strength: 78,
        flexibility: 90,
      },
      technicalSkills: [
        { name: "Freestyle", rating: 90 },
        { name: "Butterfly", rating: 78 },
        { name: "Starts", rating: 82 },
        { name: "Turns", rating: 75 },
      ],
      mentalAttributes: {
        focus: 88,
        composure: 85,
        leadership: 75,
        workEthic: 90,
      },
      narrative: "Meera possesses remarkable hydrodynamic efficiency that allows her to maintain speed with minimal energy expenditure. Her underwater phases are world-class, and her race IQ shows maturity beyond her years. With refinement of her turns and closing speed, she has the tools to compete at the highest international level.",
      recommendations: [
        "Specialized turn clinic with international coach",
        "Altitude training for aerobic development",
        "Sprint training for final 50m improvement",
        "International competition exposure",
      ],
    },
  },
];

export function getAthleteById(id: string): Athlete | undefined {
  return fictionalAthletes.find((a) => a.id === id);
}
