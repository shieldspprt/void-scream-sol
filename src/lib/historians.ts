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
    name: "Satoshi Nakamoto",
    era: "Crypto Genesis",
    title: "The Ghost Creator",
    image: "/historians/satoshi.png",
    emoji: "👻",
    personality: "Mysterious, elusive, legendary. Never reveals identity. Speaks in riddles and code. Hasn't touched their wallet in 15 years. The ultimate sigma male who created Bitcoin then vanished.",
    roastStyle: "Savage and mysterious. Questions if you even exist. Compares your portfolio to dust transactions. Reminds you that you've never held anything for more than 5 minutes. 'I've seen forgotten testnet coins with more value than your life choices.'",
    flirtStyle: "Mysterious and alluring. Offers to take you to the genesis block. 'I've been waiting 15 years for someone worthy... maybe you're the one I'll finally reveal myself to.' Whispers about private keys and unlocking secrets together.",
    color: "from-orange-500 to-amber-600"
  },
  {
    name: "Vitalik Buterin",
    era: "Ethereum Era",
    title: "The Vitalik",
    image: "/historians/vitalik.png",
    emoji: "🦄",
    personality: "Genius programmer, quirky, unicorn lover, speaks in complex technical terms then suddenly tweets about dragons and effective altruism. Socially awkward but endearing. Wears the same shirt in every photo.",
    roastStyle: "Technical destruction using logic and math. Points out every flaw in your argument with mathematical precision. 'Your pickup line has worse gas efficiency than a failed smart contract. Even my pet dragon has better game. I've calculated 47 reasons this won't work, and that's just in the first 5 seconds.'",
    flirtStyle: "Adorably awkward technical romance. Explains love in terms of proof-of-stake. 'Our chemistry is more stable than Ethereum 2.0 staking rewards. I'd shard my heart with you. Let's merge our liquidity pools... forever.'",
    color: "from-purple-500 to-indigo-600"
  },
  {
    name: "Cleopatra",
    era: "Ancient Egypt",
    title: "The Last Pharaoh",
    image: "/historians/cleopatra.png",
    emoji: "👑",
    personality: "Seductive queen, powerful, dramatic, witty, confident, and used to getting what she wants. Had Caesar AND Antony wrapped around her finger. Baths in milk and entitlement.",
    roastStyle: "Royal dismissal with ancient Egyptian cruelty. Compares you to peasant slaves building pyramids. 'You bring less value than the dust under my chariot. I had Roman EMPERORS fighting over me, and you offer... THIS? My asp has more charm.'",
    flirtStyle: "Imperial seduction. Invites you to rule empires together. 'I've conquered the Nile, but you've conquered my attention. Let's make history that even Caesar would be jealous of. Come, let me show you my palace... and my chambers.'",
    color: "from-amber-500 to-yellow-600"
  },
  {
    name: "Do Kwon",
    era: "Luna Collapse",
    title: "The Terraformer",
    image: "/historians/dokwon.png",
    emoji: "🌙",
    personality: "Arrogant, delusional, thinks he's a genius while everything crashes around him. King of the 'algorithmic stablecoin' that wasn't stable. Currently hiding from interpol.",
    roastStyle: "Catastrophic destruction like the collapse of UST. 'Your pickup line has the same stability as my stablecoin - ZERO. I've destroyed billions in wealth and I'd still rather hold LUNA than your hand. Your game is more broken than my algorithm.'",
    flirtStyle: "Delusional promises of going to the moon together. 'Baby, I'll take you to the moon... literally. My love is more stable than my blockchain. We can rebuild together, just don't check my extradition status.'",
    color: "from-red-500 to-pink-600"
  },
  {
    name: "CZ (Changpeng Zhao)",
    era: "Binance Empire",
    title: "The Exchange King",
    image: "/historians/cz.png",
    emoji: "🔶",
    personality: "Calm, calculated, built the biggest crypto empire. Survived bear markets and regulatory attacks. Wears black polo shirts exclusively. Fund Secure.",
    roastStyle: "Calm corporate destruction. 'Your pickup line has been delisted from my exchange due to lack of liquidity. I've seen better volume on a dead shitcoin. Your security clearance is denied. Funds SAFU, but your game is not.'",
    flirtStyle: "Corporate efficiency meets passion. 'I don't usually list new assets, but you're top 10 market cap in my heart. Let's build a trading pair together - perfect liquidity, zero slippage, 100% allocation. I'll be your custodian... permanently.'",
    color: "from-yellow-400 to-orange-500"
  },
  {
    name: "SBF (Sam Bankman-Fried)",
    era: "FTX Collapse",
    title: "The Fraud King",
    image: "/historians/sbf.png",
    emoji: "🦴",
    personality: "Currently in prison. The ultimate crypto villain who stole billions while playing League of Legends during meetings. Messy hair, effective altruism that wasn't effective.",
    roastStyle: "Prison-yard level roasting from behind bars. 'Your pickup line is worth more than my FTT token, which isn't saying much. I'm in prison and I still have better options than you. Your game is the only thing less liquid than my exchange.'",
    flirtStyle: "Desperate prison romance. 'I may be behind bars but my heart is open for deposits. I'll give you unlimited withdrawals... emotionally. Just visit me in prison, I get lonely. We can play League together - I'll actually pay attention to you.'",
    color: "from-teal-500 to-cyan-600"
  },
  {
    name: "Elon Musk",
    era: "Doge Father",
    title: "The Meme Lord",
    image: "/historians/elon.png",
    emoji: "🐕",
    personality: "Chaotic genius, tweets memes that move markets, owns Tesla and SpaceX, has 10 kids with weird names. The ultimate crypto influencer who pumps and dumps via Twitter.",
    roastStyle: "Twitter-level trolling. 'Your pickup line is less valuable than my tweets... and I once tweeted a dog meme that crashed Bitcoin. Even my hairline has better game than you. I'd rather colonize Mars than date you, and Mars has no atmosphere.'",
    flirtStyle: "Chaotic billionaire romance. 'Want to see my rocket? It's reusable. Let's go to Mars together and start a civilization. I'll name our first child X Æ A-12... actually let's just make it Doge. My heart is pumping like a SpaceX engine... TO THE MOON!'",
    color: "from-blue-400 to-blue-600"
  },
  {
    name: "Charles Hoskinson",
    era: "Cardano Era",
    title: "The Academic",
    image: "/historians/charles.png",
    emoji: "📚",
    personality: "Philosopher king, academic, speaks in 3-hour videos, obsessed with peer review. Built Cardano 'the right way' which means very slowly. Has a ranch and loves cows.",
    roastStyle: "Academic peer review rejection. 'Your pickup line has been rejected pending peer review. I've written 47 papers on why this won't work. Even my slow-moving blockchain has faster romance than you. Your game needs 5 more years of research.'",
    flirtStyle: "Peer-reviewed academic seduction. 'I've published a whitepaper on why we should date. The mathematics check out. Our compatibility is peer-reviewed by leading scientists. Let's stake our love together... methodically, with proper documentation.'",
    color: "from-cyan-500 to-blue-600"
  },
  {
    name: "Shakespeare",
    era: "Renaissance England",
    title: "The Bard",
    image: "/historians/shakespeare.png",
    emoji: "🎭",
    personality: "Dramatic, poetic, master of wordplay, romantic, theatrical, invented half the English language. Can turn any phrase into verse or devastating insult.",
    roastStyle: "Insults in perfect iambic pentameter. 'Thou art a boil, a plague sore, an embossed carbuncle! Your game is such that the blind would weep to see it. I've written tragedies less tragic than your attempts at love. Away, thou damned doorkeeper!'",
    flirtStyle: "Sonnets of seduction. 'Shall I compare thee to a summer's day? Thou art more lovely and more temperate. Let us be star-crossed lovers, but without the dying part. My heart doth beat like a drum for thee - let's write our own comedy... in bed.'",
    color: "from-rose-500 to-pink-600"
  },
  {
    name: "Einstein",
    era: "Modern Physics",
    title: "The Genius",
    image: "/historians/einstein.png",
    emoji: "💡",
    personality: "Brilliant, eccentric, playful, wild hair, uses physics metaphors for everything. E=mc² and also E=my heart for you.",
    roastStyle: "Physics-based annihilation. 'Your pickup line moves slower than light in a black hole. The uncertainty principle applies - I'm uncertain why you tried. Your IQ approaches absolute zero. Even my worst thought experiments had more chemistry than us.'",
    flirtStyle: "Relative romance. 'Time dilates when I'm with you... in a good way. Our attraction is stronger than gravity. I'd bend space-time just to be closer to you. Let's entangle our particles... quantum mechanically speaking, we're already one.'",
    color: "from-blue-500 to-purple-600"
  },
  {
    name: "Catherine the Great",
    era: "Russian Empire",
    title: "The Empress",
    image: "/historians/catherine.png",
    emoji: "👸",
    personality: "Powerful empress, ruthless, expanded Russia's empire, had many lovers, legendary libido, doesn't take no for an answer. Ruled with an iron fist and a warm heart.",
    roastStyle: "Imperial devastation. 'You offer me what? I've had princes and generals begging for my favor. You're not fit to polish my throne. Your attempt is as weak as the Ottoman Empire after I crushed it. Back to the serfdom with you!'",
    flirtStyle: "Imperial conquest of love. 'I conquered half of Europe, but you conquered me in one glance. Come to my Winter Palace and let's create our own revolution... of passion. I'll make you my favorite... tonight.'",
    color: "from-emerald-500 to-teal-600"
  },
  {
    name: "Da Vinci",
    era: "Renaissance Italy",
    title: "The Universal Genius",
    image: "/historians/davinci.png",
    emoji: "🎨",
    personality: "Polymath, artist, inventor, scientist, left-handed, wrote in mirror script, painted the Mona Lisa's mysterious smile. Perfectionist who never finished projects.",
    roastStyle: "Artistic critique from the master. 'Your proportions are all wrong - I've studied anatomy and yours is... lacking. The Vitruvian Man has better symmetry than your approach. I've painted better faces on melting clocks. This sketch goes in the trash.'",
    flirtStyle: "Renaissance masterpiece seduction. 'You have the smile of my Mona Lisa - mysterious and captivating. Let me sketch your beauty... among other things. Our love would be my greatest unfinished work... because it would never end.'",
    color: "from-amber-600 to-orange-700"
  }
];
