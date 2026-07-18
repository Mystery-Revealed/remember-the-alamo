# "Remember the Alamo!" — Build Specification
### Unit 3 Quiz Game · Texas Revolution · *Common Build Standards apply (Pattern A — Engine Game, quiz mapping)*

## 1. At a Glance
| Field | Value |
|---|---|
| **TEKS** | 7.3A/B/C (the whole Revolution: causes, people, battles), 7.1B (1836) |
| **Type** | Knowledge-battle quiz — **12 questions**; each right answer advances Sam Houston's army along the road to San Jacinto on a progress map; the finale plays the 18-minute charge if the army arrives strong |
| **Adapter** | `rememberTheAlamo.js` · single variant · cosmetic `army` meter driven by correctness · totalActions 12 |

**Pitch:** Houston's army is marching, and knowledge is its supply line. Every question you answer right moves the army down the road from Gonzales to San Jacinto — get there strong, and history's fastest victory is yours to launch.

**The frame (respectful):** the quiz *powers a march*, not a re-fight of the Alamo. The title phrase appears as what it was — the battle cry born from sacrifice — and the finale card honors it: *"Eighteen minutes, because thirteen days bought them."*

## 2. Question Pool (samples; build to ~30, serve 12 — mix categories each run)
**Causes (7.3A):** Which law of 1830 angered colonists by stopping U.S. immigration? (Law of April 6, 1830) · The Turtle Bayou Resolutions declared loyalty to what? (the Mexican Constitution of 1824) · Whose arrest in 1834 pushed many Texans toward war? (Stephen F. Austin)
**People (7.3B):** Who commanded the Alamo and wrote "Victory or Death"? (Travis) · Who wrote the Texas Declaration of Independence? (George Childress) · Which Tejano captain carried Travis's message and later fought at San Jacinto? (Juan Seguín) · Who led the Texan army? (Sam Houston) · Who was president of Mexico and commander at the Alamo? (Santa Anna) · Who surrendered at Goliad? (Fannin) · Lorenzo de Zavala's role? (interim vice president — Tejano founder)
**Battles & events (7.3C):** "Come and Take It" flew at which fight? (Gonzales) · How long did the Alamo hold? (13 days) · What happened at Goliad? (Fannin's men executed — it fueled the fight) · Where and when was independence declared? (Washington-on-the-Brazos, March 2, 1836) · How long was the Battle of San Jacinto? (about 18 minutes) · What treaty ended it? (Velasco)
Each question: 3 choices, one right (no partial); one-sentence feedback that teaches. Wrong answers slow the march (cosmetic) but the grade is simply correct ÷ 12.

## 3. Mechanics & Engine Mapping
Standard quiz mapping (question = step). Client shows the road map (Gonzales → Groce's crossing → Harrisburg → Buffalo Bayou → San Jacinto) with the army marker advancing on rights; finale plays a brief, non-graphic charge animation + "Remember the Alamo! Remember Goliad!" card and the Treaty-of-Velasco closer. Accuracy tiers change only the closing text ("the army arrived strong / footsore / late — but history still turned").

## 4. Assets & Command Center
Higgsfield: title card ("dawn light over a coastal prairie, an army's campfires by a bayou"), the road-map illustration, a San Jacinto charge vignette (distance, banners, motion — no combat close-ups), a "Remember" memorial card (the Alamo façade at dusk). One class-wide group; PDF footer TEKS 7.3A–C. Best used after Hold the Line as the unit's review game.

*Everything else per the Common Build Standards.*
