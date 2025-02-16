export const loadingFacts = {
  tech: [
    'The first computer bug was an actual bug - a moth stuck in a relay',
    'The first computer mouse was made of wood and had only one button',
    'The first YouTube video was about elephants at a zoo',
    'The QWERTY keyboard was designed to slow typists down',
    "The first tweet ever was 'just setting up my twttr'",
    'The first email spam was sent in 1978',
    'The first domain name ever registered still exists - Symbolics.com',
    'The first webcam was created to monitor a coffee pot',
    "The first iPhone didn't have copy and paste functionality",
    'The loading bar was invented because humans get anxious without progress indicators',
  ],
  zephyr: [
    "Legend says Zephyr's dark mode was inspired by a midnight coding session",
    'Zephyr once fixed a bug by itself... or maybe that was just a dream',
    "Some say Zephyr's animations are so smooth, they can hypnotize developers",
    "Zephyr's creator once coded for 48 hours straight, fueled only by memes",
    "Zephyr's first commit message was 'it works... somehow'",
    'They say every time Zephyr crashes, a developer learns to write better error handling',
    "Zephyr's loading screen has seen more developers fall asleep than any bed",
    'The aurora effects were inspired by a coffee-induced hallucination',
    "Zephyr's code is so clean, it makes Marie Kondo jealous",
    "Some developers swear they've seen Zephyr write its own features at 3 AM",
  ],
  dev: [
    'A developer somewhere is questioning their life choices right now',
    'This loading screen has seen more updates than some production features',
    'The creator spent more time on this loading animation than actual error handling',
    'Fun fact: This fact was generated while procrastinating on fixing bugs',
    'Loading screens: Where developers hide their best jokes',
    'This loading animation is powered by coffee and questionable decisions',
    'The developer responsible for this is probably debugging something else right now',
    'Plot twist: The loading is fake, we just like the animation',
    "Error 418: I'm a teapot (Yes, that's a real HTTP status code)",
    "The cloud is just someone else's computer",
  ],
} as const;

export const getRandomFact = (): string => {
  const categories = Object.values(loadingFacts);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  return randomCategory
    ? randomCategory[Math.floor(Math.random() * randomCategory.length)] ||
        'No facts available'
    : 'No facts available';
};
