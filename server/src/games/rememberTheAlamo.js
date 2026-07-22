// rememberTheAlamo.js — Unit 3 review game adapter: "Remember the Alamo!"
// (SOLO only). Everyone is Sam Houston's marching army. Knowledge is its supply
// line: each question answered right moves the army down the road from Gonzales
// to San Jacinto. Answer 12 questions (drawn from a ~30-question bank, mixed by
// category each run), and if the army arrives strong, history's fastest victory
// is yours (spec §1–3).
//
// THE FRAME IS RESPECTFUL (spec §1). The quiz POWERS A MARCH — it is not a
// re-fight of the Alamo. "Remember the Alamo!" appears as what it was: the
// battle cry born from sacrifice. The finale honors it: "Eighteen minutes,
// because thirteen days bought them."
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER (correct flags + feedback). The
// factory ships shuffled labels only; the client submits { choiceIndex }.
// Student-facing text is written at a 5th grade reading level (spec §2).

import { createQuizGame } from './_quizGame.js';

// ---------------------------------------------------------------------------
// Board metadata (shipped to clients at match:begin — display info only)
// ---------------------------------------------------------------------------

export const METERS = {
  army: { name: 'Army Strength', icon: 'army', blurb: 'The spirit and order of Houston’s marching army. Right answers feed it; wrong ones sap it.' },
};

// The three TEKS question categories the bank mixes each run (spec §2).
export const CATEGORIES = {
  causes:  { name: 'Causes', teks: '7.3A' },
  people:  { name: 'People', teks: '7.3B' },
  battles: { name: 'Battles & Events', teks: '7.3C' },
};

// The road from Gonzales to San Jacinto. `frac` is the marker's position (0–1)
// when the army has marched that far; the client places each pin along the road.
// The army token sits at correct ÷ 12, so a perfect run reaches San Jacinto.
export const WAYPOINTS = [
  { key: 'gonzales',   label: 'Gonzales',        sub: 'the march begins',   frac: 0.00 },
  { key: 'colorado',   label: 'Colorado River',  sub: 'the retreat east',   frac: 0.22 },
  { key: 'groce',      label: 'Groce’s Crossing', sub: 'drilling the army',  frac: 0.45 },
  { key: 'fork',       label: 'The Fork',        sub: 'turn to face them',  frac: 0.66 },
  { key: 'bayou',      label: 'Buffalo Bayou',   sub: 'Lynch’s Ferry',      frac: 0.85 },
  { key: 'sanjacinto', label: 'San Jacinto',     sub: 'April 21, 1836',     frac: 1.00 },
];

const SERVE = 12; // 6 legs × 2 questions

// ---------------------------------------------------------------------------
// LEGS — the six narrative event cards (2 questions each). The story always
// marches Gonzales → San Jacinto in order; how far the little army token gets
// depends on how many questions the class answers right.
// ---------------------------------------------------------------------------

// Every leg shares the same road-map parchment art as its backdrop (spec §4
// budgets one "road-map illustration" total, not a cinematic scene per leg —
// this is the lighter, faster review game meant to follow Hold the Line). The
// same file also renders behind the live road map on the match screen.
const LEG_ART = 'road_map.jpg';

export const LEGS = [
  {
    title: 'Houston Takes Command', date: 'March 11, 1836', image: LEG_ART, waypoint: 'gonzales',
    event: 'At Gonzales, Sam Houston takes charge of a small, raw army. Then hard news arrives: the Alamo has fallen. Every right answer keeps his tired soldiers moving.',
  },
  {
    title: 'The Runaway Scrape', date: 'mid-March 1836', image: LEG_ART, waypoint: 'colorado',
    event: 'Houston leads the army east, away from Santa Anna. Families flee their homes too, in a scramble called the Runaway Scrape. Keep the army fed with knowledge and it holds together.',
  },
  {
    title: 'Drilling at Groce’s Crossing', date: 'late March 1836', image: LEG_ART, waypoint: 'groce',
    event: 'On the Brazos River at Groce’s plantation, Houston drills his men into real soldiers. Two cannons — the Twin Sisters — arrive. A sharp army marches faster.',
  },
  {
    title: 'The Fork in the Road', date: 'April 17, 1836', image: LEG_ART, waypoint: 'fork',
    event: 'The road splits. One way leads to safety; the other, toward Santa Anna. The soldiers choose the fighting road. Right answers steady their nerve.',
  },
  {
    title: 'Racing to Harrisburg', date: 'April 18–20, 1836', image: LEG_ART, waypoint: 'bayou',
    event: 'Houston learns Santa Anna is close, near Harrisburg. The army marches hard and crosses Buffalo Bayou to catch him. Almost there — keep the supply line strong.',
  },
  {
    title: 'San Jacinto', date: 'April 21, 1836', image: LEG_ART, waypoint: 'sanjacinto',
    event: 'In the quiet of afternoon, the Texans line up. Then they charge, shouting “Remember the Alamo! Remember Goliad!” The last questions decide how strong your army arrives.',
  },
];

// ---------------------------------------------------------------------------
// QUESTION BANK — ~30 questions across the three TEKS categories. Each has 3
// choices, exactly one correct, and one teaching sentence of feedback. The
// factory serves a balanced, shuffled 12 per run (4 from each category).
// ---------------------------------------------------------------------------

export const BANK = [
  // ---- CAUSES (7.3A) ----
  { id: 'c1', category: 'causes',
    prompt: 'Which law of 1830 angered colonists by stopping most immigration from the United States?',
    choices: [
      { label: 'The Law of April 6, 1830', correct: true,  feedback: 'Right — the Law of April 6, 1830 halted U.S. immigration and taxed trade, which upset many colonists.' },
      { label: 'The Treaty of Velasco',    correct: false, feedback: 'Not quite — the Treaty of Velasco came later, in 1836, and ended the war.' },
      { label: 'The Turtle Bayou Resolutions', correct: false, feedback: 'Not quite — those were a statement Texans wrote in 1832, not a Mexican law.' },
    ] },
  { id: 'c2', category: 'causes',
    prompt: 'The Turtle Bayou Resolutions of 1832 said the Texans were loyal to what?',
    choices: [
      { label: 'The King of Spain',                correct: false, feedback: 'Not quite — Spain no longer ruled Mexico by then.' },
      { label: 'The United States',                correct: false, feedback: 'Not quite — they were pledging loyalty to Mexico’s constitution, not the U.S.' },
      { label: 'The Mexican Constitution of 1824', correct: true,  feedback: 'Right — Texans said they were not rebels; they backed Mexico’s 1824 Constitution against Santa Anna.' },
    ] },
  { id: 'c3', category: 'causes',
    prompt: 'Whose arrest in 1834 pushed many Texans toward war?',
    choices: [
      { label: 'Sam Houston',       correct: false, feedback: 'Not quite — Houston led the army later; he was not the one arrested.' },
      { label: 'Stephen F. Austin', correct: true,  feedback: 'Right — Austin was jailed in Mexico City after asking for reforms, which angered colonists.' },
      { label: 'William Travis',    correct: false, feedback: 'Not quite — Travis commanded the Alamo; he was not arrested in 1834.' },
    ] },
  { id: 'c4', category: 'causes',
    prompt: 'Santa Anna threw out the Constitution of 1824 and seized strong central power. That made him a —',
    choices: [
      { label: 'king',     correct: false, feedback: 'Not quite — he was a general and president, not a king.' },
      { label: 'president chosen by Texans', correct: false, feedback: 'Not quite — Texans never chose him; he took power for himself.' },
      { label: 'dictator', correct: true,  feedback: 'Right — ending the 1824 Constitution and ruling with near-total power made Santa Anna a dictator.' },
    ] },
  { id: 'c5', category: 'causes',
    prompt: 'Why did many colonists dislike the rule that they must be Catholic?',
    choices: [
      { label: 'It went against their own religion', correct: true,  feedback: 'Right — most colonists were Protestant, so the rule clashed with their beliefs.' },
      { label: 'It cost too much money',             correct: false, feedback: 'Not quite — the problem was faith, not a fee.' },
      { label: 'It banned farming',                  correct: false, feedback: 'Not quite — the rule was about religion, not farming.' },
    ] },
  { id: 'c6', category: 'causes',
    prompt: 'The “Come and Take It” flag was raised when Mexican soldiers tried to take back what from Gonzales?',
    choices: [
      { label: 'a church bell', correct: false, feedback: 'Not quite — the fight was over a cannon, not a bell.' },
      { label: 'a cannon',     correct: true,  feedback: 'Right — Gonzales refused to hand over a small cannon, and the first shots followed.' },
      { label: 'a herd of cattle', correct: false, feedback: 'Not quite — it was a cannon the town would not give up.' },
    ] },
  { id: 'c7', category: 'causes',
    prompt: 'What was one big reason Texans wanted their own government?',
    choices: [
      { label: 'They felt Mexico’s laws under Santa Anna ignored their needs', correct: true, feedback: 'Right — colonists felt far-off leaders ignored their rights, so they wanted self-rule.' },
      { label: 'They wanted to join Spain',   correct: false, feedback: 'Not quite — Spain no longer ruled, and they were not trying to rejoin it.' },
      { label: 'They disliked cotton farming', correct: false, feedback: 'Not quite — cotton was important to them; that was not the reason.' },
    ] },
  { id: 'c8', category: 'causes',
    prompt: 'Slavery was a growing tension because Mexico had done what?',
    choices: [
      { label: 'paid settlers to enslave more people', correct: false, feedback: 'Not quite — Mexico was trying to end slavery, not grow it.' },
      { label: 'moved to end slavery',          correct: true,  feedback: 'Right — Mexico moved to limit and end slavery, which clashed with Anglo colonists who relied on enslaved people’s labor.' },
      { label: 'made slavery required',         correct: false, feedback: 'Not quite — Mexico opposed slavery; it never required it.' },
    ] },
  { id: 'c9', category: 'causes',
    prompt: 'The short Fredonian Rebellion of 1826 was an early sign of what?',
    choices: [
      { label: 'lasting peace in Texas',    correct: false, feedback: 'Not quite — it was a sign of trouble, not peace.' },
      { label: 'a war with the United States', correct: false, feedback: 'Not quite — it was a local revolt, not a U.S. war.' },
      { label: 'growing conflict between colonists and Mexico', correct: true, feedback: 'Right — this brief revolt was an early crack in the bond between colonists and Mexico.' },
    ] },
  { id: 'c10', category: 'causes',
    prompt: 'As more Americans moved to Texas, what did the Mexican government fear?',
    choices: [
      { label: 'growing too little cotton', correct: false, feedback: 'Not quite — the worry was control of the land, not crops.' },
      { label: 'losing control of Texas', correct: true,  feedback: 'Right — so many U.S. settlers arrived that Mexico feared losing Texas, leading to the 1830 law.' },
      { label: 'building too few churches', correct: false, feedback: 'Not quite — the fear was political control, not churches.' },
    ] },

  // ---- PEOPLE (7.3B) ----
  { id: 'p1', category: 'people',
    prompt: 'Who commanded the Alamo and wrote the letter ending “Victory or Death”?',
    choices: [
      { label: 'William B. Travis', correct: true,  feedback: 'Right — Travis’s famous letter from the Alamo called for help and became a symbol of the fight.' },
      { label: 'Sam Houston',       correct: false, feedback: 'Not quite — Houston led the field army, not the Alamo.' },
      { label: 'Davy Crockett',     correct: false, feedback: 'Not quite — Crockett fought at the Alamo but did not command it or write that letter.' },
    ] },
  { id: 'p2', category: 'people',
    prompt: 'Who led the group that wrote the Texas Declaration of Independence?',
    choices: [
      { label: 'Lorenzo de Zavala',  correct: false, feedback: 'Not quite — Zavala became vice president, but Childress led the writing.' },
      { label: 'James Fannin',       correct: false, feedback: 'Not quite — Fannin was an army colonel, not the declaration’s author.' },
      { label: 'George Childress',   correct: true,  feedback: 'Right — George Childress led the writing of the declaration at Washington-on-the-Brazos.' },
    ] },
  { id: 'p3', category: 'people',
    prompt: 'Which Tejano captain carried Travis’s message from the Alamo and later fought at San Jacinto?',
    choices: [
      { label: 'Santa Anna',    correct: false, feedback: 'Not quite — Santa Anna led the Mexican army against Texas.' },
      { label: 'Ben Milam',     correct: false, feedback: 'Not quite — Milam led an earlier fight at San Antonio and died there in 1835.' },
      { label: 'Juan Seguín',   correct: true,  feedback: 'Right — Juan Seguín rode through enemy lines with the Alamo’s call for help and fought on at San Jacinto.' },
    ] },
  { id: 'p4', category: 'people',
    prompt: 'Who led the Texan army to victory at San Jacinto?',
    choices: [
      { label: 'William Travis', correct: false, feedback: 'Not quite — Travis had died at the Alamo weeks before.' },
      { label: 'Sam Houston',    correct: true,  feedback: 'Right — General Sam Houston trained the army and led the surprise charge at San Jacinto.' },
      { label: 'James Fannin',   correct: false, feedback: 'Not quite — Fannin was captured at Goliad before San Jacinto.' },
    ] },
  { id: 'p5', category: 'people',
    prompt: 'Who was the president of Mexico and the general who attacked the Alamo?',
    choices: [
      { label: 'Santa Anna',       correct: true,  feedback: 'Right — Santa Anna led Mexico and its army, and he commanded the attack on the Alamo.' },
      { label: 'Lorenzo de Zavala', correct: false, feedback: 'Not quite — Zavala was a Tejano leader who joined the Texas side.' },
      { label: 'Vicente Guerrero', correct: false, feedback: 'Not quite — Guerrero was an earlier Mexican president, not the Alamo’s general.' },
    ] },
  { id: 'p6', category: 'people',
    prompt: 'Who surrendered near Goliad, which led to his men being executed?',
    choices: [
      { label: 'Sam Houston',   correct: false, feedback: 'Not quite — Houston kept his army together and won at San Jacinto.' },
      { label: 'Juan Seguín',   correct: false, feedback: 'Not quite — Seguín survived and fought at San Jacinto.' },
      { label: 'James Fannin',  correct: true,  feedback: 'Right — Colonel Fannin surrendered near Goliad, and his men were later executed on Santa Anna’s order.' },
    ] },
  { id: 'p7', category: 'people',
    prompt: 'What role did Lorenzo de Zavala take in the new Texas government?',
    choices: [
      { label: 'army general',           correct: false, feedback: 'Not quite — Zavala was a statesman, not a battlefield general.' },
      { label: 'interim vice president', correct: true,  feedback: 'Right — Zavala, a respected Tejano leader, became the first vice president of the Republic of Texas.' },
      { label: 'Alamo commander',        correct: false, feedback: 'Not quite — Travis commanded the Alamo; Zavala served in government.' },
    ] },
  { id: 'p8', category: 'people',
    prompt: 'Which famous frontiersman and former U.S. congressman died at the Alamo?',
    choices: [
      { label: 'Davy Crockett',    correct: true,  feedback: 'Right — Davy Crockett of Tennessee joined the Alamo defenders and died in the siege.' },
      { label: 'Stephen F. Austin', correct: false, feedback: 'Not quite — Austin was in the government and army, and he was not at the Alamo.' },
      { label: 'George Childress',  correct: false, feedback: 'Not quite — Childress helped write the declaration, far from the Alamo.' },
    ] },
  { id: 'p9', category: 'people',
    prompt: 'Susanna Dickinson is remembered mainly because she —',
    choices: [
      { label: 'survived the Alamo and carried its story out', correct: true,  feedback: 'Right — Santa Anna let survivor Susanna Dickinson go, and she spread word of the Alamo’s fall.' },
      { label: 'led the Texan cavalry',   correct: false, feedback: 'Not quite — she was a survivor and witness, not a cavalry leader.' },
      { label: 'signed the Treaty of Velasco', correct: false, feedback: 'Not quite — leaders signed that treaty; her role was carrying the Alamo’s story.' },
    ] },
  { id: 'p10', category: 'people',
    prompt: 'Stephen F. Austin is called the “Father of Texas” because he —',
    choices: [
      { label: 'won the Battle of San Jacinto', correct: false, feedback: 'Not quite — Houston won San Jacinto; Austin is known for leading colonists.' },
      { label: 'served as Mexico’s president', correct: false, feedback: 'Not quite — Austin never led Mexico; he led Texas colonists.' },
      { label: 'brought the first large group of American colonists', correct: true, feedback: 'Right — Austin’s colony brought hundreds of families, earning him the name “Father of Texas.”' },
    ] },

  // ---- BATTLES & EVENTS (7.3C) ----
  { id: 'b1', category: 'battles',
    prompt: 'The “Come and Take It” fight — the revolution’s first shots — happened at which town?',
    choices: [
      { label: 'Goliad',      correct: false, feedback: 'Not quite — Goliad is known for a later, tragic event.' },
      { label: 'Gonzales',    correct: true,  feedback: 'Right — the revolution’s first shots rang out at Gonzales over a small cannon.' },
      { label: 'Harrisburg',  correct: false, feedback: 'Not quite — Harrisburg comes near the end of the story, on the way to San Jacinto.' },
    ] },
  { id: 'b2', category: 'battles',
    prompt: 'How long did the defenders hold the Alamo?',
    choices: [
      { label: '13 days', correct: true,  feedback: 'Right — the Alamo held for 13 days before it fell on March 6, 1836.' },
      { label: '3 days',  correct: false, feedback: 'Not quite — the stand lasted far longer, a full 13 days.' },
      { label: '30 days', correct: false, feedback: 'Not quite — it was 13 days, not a month.' },
    ] },
  { id: 'b3', category: 'battles',
    prompt: 'What happened to Fannin’s men at Goliad?',
    choices: [
      { label: 'They escaped to Louisiana',   correct: false, feedback: 'Not quite — most did not escape; the Goliad event was a tragedy.' },
      { label: 'They were executed after surrendering', correct: true,  feedback: 'Right — Santa Anna ordered the execution of Fannin’s men, which enraged and rallied Texans.' },
      { label: 'They won the battle',         correct: false, feedback: 'Not quite — they surrendered and were killed, which fueled the fight.' },
    ] },
  { id: 'b4', category: 'battles',
    prompt: 'Where and when did Texas declare independence?',
    choices: [
      { label: 'The Alamo, March 6, 1836',    correct: false, feedback: 'Not quite — the Alamo fell on March 6; independence was declared days earlier.' },
      { label: 'San Jacinto, April 21, 1836', correct: false, feedback: 'Not quite — San Jacinto was the final battle, not the declaration.' },
      { label: 'Washington-on-the-Brazos, March 2, 1836', correct: true,  feedback: 'Right — delegates signed the Texas Declaration of Independence there on March 2, 1836.' },
    ] },
  { id: 'b5', category: 'battles',
    prompt: 'About how long did the Battle of San Jacinto last?',
    choices: [
      { label: 'about 18 minutes', correct: true,  feedback: 'Right — the main fighting at San Jacinto lasted only about 18 minutes.' },
      { label: 'about 13 days',    correct: false, feedback: 'Not quite — that was the Alamo siege; San Jacinto was over in minutes.' },
      { label: 'about 3 hours',    correct: false, feedback: 'Not quite — the charge was famously fast, about 18 minutes.' },
    ] },
  { id: 'b6', category: 'battles',
    prompt: 'Which treaty ended the fighting after San Jacinto?',
    choices: [
      { label: 'The Treaty of Guadalupe Hidalgo', correct: false, feedback: 'Not quite — that treaty ended the later U.S.–Mexican War in 1848.' },
      { label: 'The Adams-Onís Treaty',        correct: false, feedback: 'Not quite — that 1819 treaty set an earlier border, long before the revolution.' },
      { label: 'The Treaty of Velasco',        correct: true,  feedback: 'Right — the Treaty of Velasco, signed after San Jacinto, ended the war and freed Santa Anna.' },
    ] },
  { id: 'b7', category: 'battles',
    prompt: 'What battle cry did the Texans shout as they charged at San Jacinto?',
    choices: [
      { label: '“Come and Take It!”',   correct: false, feedback: 'Not quite — that was the Gonzales flag at the war’s start.' },
      { label: '“Remember the Alamo! Remember Goliad!”', correct: true, feedback: 'Right — the cry honored the fallen at the Alamo and Goliad and drove the charge.' },
      { label: '“Victory or Death!”',   correct: false, feedback: 'Not quite — that was Travis’s Alamo letter, not the San Jacinto cry.' },
    ] },
  { id: 'b8', category: 'battles',
    prompt: 'What was the “Runaway Scrape”?',
    choices: [
      { label: 'Texan families fleeing east from Santa Anna’s army', correct: true, feedback: 'Right — as the army retreated, families fled their homes east in the Runaway Scrape.' },
      { label: 'A cattle drive north to Kansas', correct: false, feedback: 'Not quite — cattle drives came decades later; this was families fleeing war.' },
      { label: 'A famous horse race',            correct: false, feedback: 'Not quite — it was a frightening flight from danger, not a race.' },
    ] },
  { id: 'b9', category: 'battles',
    prompt: 'Why did Houston retreat east for weeks before San Jacinto?',
    choices: [
      { label: 'Because he had given up',   correct: false, feedback: 'Not quite — he was buying time and preparing, not quitting.' },
      { label: 'To leave Texas for good',   correct: false, feedback: 'Not quite — he stayed in Texas and turned to fight at San Jacinto.' },
      { label: 'To train his raw army and pick the right moment to strike', correct: true, feedback: 'Right — Houston retreated to drill his green army and wait for the best chance.' },
    ] },
  { id: 'b10', category: 'battles',
    prompt: 'At San Jacinto, the Texans attacked while Santa Anna’s army was —',
    choices: [
      { label: 'crossing a wide river',    correct: false, feedback: 'Not quite — the surprise came during their rest, not a river crossing.' },
      { label: 'resting in the afternoon', correct: true,  feedback: 'Right — Houston struck during the Mexican army’s afternoon rest, catching them off guard.' },
      { label: 'marching at dawn',         correct: false, feedback: 'Not quite — the attack came in the afternoon while they rested.' },
    ] },
];

// ---------------------------------------------------------------------------
// Endings & debrief. The GRADE is accuracy (correct ÷ 12). Accuracy tiers change
// only the closing text — how strong the army arrived (spec §3).
// ---------------------------------------------------------------------------

export const ENDINGS = {
  strong: { key: 'strong', title: 'The Army Arrived Strong',
    text: 'Well marched! Your army reached San Jacinto sharp, fed, and ready. When the charge came — “Remember the Alamo! Remember Goliad!” — it struck like lightning. Texas won its independence in about eighteen minutes.' },
  footsore: { key: 'footsore', title: 'Footsore, but in Time',
    text: 'Your army straggled a little on the road, but it reached San Jacinto in time. Tired boots and all, the Texans charged — “Remember the Alamo! Remember Goliad!” — and still turned the whole war in about eighteen minutes.' },
  late: { key: 'late', title: 'Late — but History Still Turned',
    text: 'The supply line of knowledge ran thin, and the army arrived late and worn. History was kinder than the march: the real Texans still charged at San Jacinto and won. Study the road again and lead them there strong.' },
};

// Ending tier from accuracy (0–100). 12 questions → each is worth ~8 points.
export function endingFor(accuracy) {
  if (accuracy >= 75) return ENDINGS.strong;   // ~9+ of 12
  if (accuracy >= 42) return ENDINGS.footsore;  // ~5–8 of 12
  return ENDINGS.late;                          // ~4 or fewer
}

export const DEBRIEF =
  'The real march took about six weeks. Sam Houston retreated east, drilling his small army, while Santa Anna chased him. On April 21, 1836, at San Jacinto, the Texans charged shouting “Remember the Alamo! Remember Goliad!” and won in about eighteen minutes. The Treaty of Velasco ended the fighting, and Texas became an independent republic. The fight itself was short — the days at the Alamo, and the men lost at Goliad, were what made it possible.';

export const META = {
  meters: METERS,
  categories: CATEGORIES,
  waypoints: WAYPOINTS,
  serve: SERVE,
};

export default createQuizGame({
  id: 'remember-the-alamo',
  title: 'Remember the Alamo!',
  side: 'army',                // everyone marches with Houston — a single class group
  bank: BANK,
  serve: SERVE,
  legs: LEGS,
  meta: META,
  startStrength: 40,
  rightDelta: 7,
  wrongDelta: -5,
  strengthKey: 'army',
  endingFor,
  debrief: DEBRIEF,
});
