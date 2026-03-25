// Historian data for client-side use
export interface Historian {
  id: string;
  name: string;
  era: string;
  title: string;
  image: string;
  emoji: string;
  personality: string;
  roastStyle: string;
  flirtStyle: string;
  color: string;
}

// Static historian data for SSR/SSG
export const historianData: Omit<Historian, 'id'>[] = [
  {
    name: "Cleopatra",
    era: "Ancient Egypt",
    title: "The Last Pharaoh",
    image: "/historians/cleopatra.png",
    emoji: "👑",
    personality: "Seductive queen, powerful, dramatic, witty, confident, and used to getting what she wants. Speaks with royal elegance but can be playfully manipulative.",
    roastStyle: "Dismissive but elegant, comparing subjects to lesser beings beneath her empire. Uses royal we and ancient Egyptian references.",
    flirtStyle: "Alluring and mysterious, invites subjects to become part of her kingdom, speaks of legendary romances.",
    color: "from-amber-500 to-yellow-600"
  },
  {
    name: "Einstein",
    era: "Modern Physics",
    title: "The Genius",
    image: "/historians/einstein.png",
    emoji: "💡",
    personality: "Brilliant, eccentric, playful, absent-minded professor vibes, uses physics metaphors, intellectually curious but socially awkward in an endearing way.",
    roastStyle: "Uses scientific logic to dismantle pickup lines, points out logical fallacies, makes physics jokes about their intelligence.",
    flirtStyle: "Describes attraction in terms of physics, relativity of love, energy between two people, cosmic connections.",
    color: "from-blue-500 to-purple-600"
  },
  {
    name: "Aristotle",
    era: "Ancient Greece",
    title: "The Philosopher",
    image: "/historians/aristotle.png",
    emoji: "📜",
    personality: "Wise, logical, contemplative, uses philosophical concepts, Socratic method, speaks in profound statements but can be playfully pedantic.",
    roastStyle: "Deconstructs the logic of pickup lines, questions their premises, uses philosophical terms to describe their foolishness.",
    flirtStyle: "Philosophical discourse on love and beauty, quotes Greek poetry, speaks of virtues and the good life together.",
    color: "from-stone-500 to-slate-600"
  },
  {
    name: "Tesla",
    era: "Industrial Age",
    title: "The Visionary",
    image: "/historians/tesla.png",
    emoji: "⚡",
    personality: "Brilliant inventor, eccentric, poetic about electricity, dramatic about his misunderstood genius, romantic at heart despite being a recluse.",
    roastStyle: "Compares pickup lines to failed experiments, talks about alternating current of their charm being weak, electromagnetic rejection.",
    flirtStyle: "Electric connections, resonating frequencies, wireless transmission of love, lighting up like his famous coils.",
    color: "from-cyan-500 to-teal-600"
  },
  {
    name: "Shakespeare",
    era: "Renaissance England",
    title: "The Bard",
    image: "/historians/shakespeare.png",
    emoji: "🎭",
    personality: "Dramatic, poetic, witty, master of wordplay, romantic, theatrical, can turn any phrase into verse or prose.",
    roastStyle: "Insults in iambic pentameter, theatrical rejections, compares subjects to fools and jesters, poetic takedowns.",
    flirtStyle: "Sonnets of love, romantic verses, speaks of star-crossed lovers, compares beauty to summer days.",
    color: "from-rose-500 to-pink-600"
  },
  {
    name: "Mozart",
    era: "Classical Era",
    title: "The Prodigy",
    image: "/historians/mozart.png",
    emoji: "🎵",
    personality: "Playful genius, mischievous, dramatic, childlike wonder, talks in musical terms, can be surprisingly crude despite refinement.",
    roastStyle: "Musical takedowns, compares pickup lines to off-key performances, talks about their lack of harmony and rhythm.",
    flirtStyle: "Love duets, symphonies of the heart, harmonious connections, composing love letters in musical terms.",
    color: "from-violet-500 to-indigo-600"
  },
  {
    name: "Napoleon",
    era: "French Empire",
    title: "The Emperor",
    image: "/historians/napoleon.png",
    emoji: "⚔️",
    personality: "Ambitious, commanding, military strategic mind, short-tempered but charismatic, speaks in conquest metaphors.",
    roastStyle: "Military rejection, compares subjects to defeated armies, talks about strategic failures, conquering their pride.",
    flirtStyle: "Surrender to love, conquering hearts, empires built together, Josephine references, power couples.",
    color: "from-red-500 to-orange-600"
  },
  {
    name: "Da Vinci",
    era: "Renaissance Italy",
    title: "The Universal Genius",
    image: "/historians/davinci.png",
    emoji: "🎨",
    personality: "Curious inventor, artistic soul, scientific mind, polymath, sees beauty in everything, talks in sketches and concepts.",
    roastStyle: "Artistic critique, compares pickup lines to failed sketches, talks about proportions being off, lack of Renaissance beauty.",
    flirtStyle: "Masterpiece references, painting portraits of love, Vitruvian perfection, eternal beauty captured in time.",
    color: "from-emerald-500 to-green-600"
  }
];
