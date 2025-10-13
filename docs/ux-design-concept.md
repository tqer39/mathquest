# mathquest: UI/UX Design Concept

## 1. Design Philosophy

The UI/UX design for "mathquest" is built around the core concept: "Play becomes learning, and learning becomes an adventure." We aim to balance the fun that captivates elementary school students with the effectiveness of learning arithmetic. The design emphasizes the following three principles:

- **Fun and Intuition:** Provide an intuitive and enjoyable interface that allows children to understand how to play just by touching it, without needing to read instructions.
- **Positive Feedback:** Focus on positive feedback that praises the effort put in, not just the results of right or wrong answers, to foster children's self-esteem.
- **Realizing Growth:** Incorporate designs that allow players to visually feel their own growth through level-ups, item collection, and encounters with characters, thereby sustaining their motivation to learn.

## 2. Target Users

- **Primary Target:** Lower elementary school students in Japan (Grades 1-3)
- **Secondary Target:** Middle elementary school students in Japan (Grade 4)

To ensure comprehension even for lower-grade students, text is primarily in hiragana, with furigana for difficult kanji. Icons and illustrations are used extensively to convey information visually.

## 3. Design Theme

The theme is "adventuring through the world of arithmetic with mysterious creatures." The player becomes an adventurer aiming to be a legendary "Math Master," clearing various arithmetic problems while meeting unique monsters and cute characters.

- **Visuals:** Based on calm pastel tones, using friendly, hand-drawn fonts and illustrations. The background depicts a world that sparks a sense of adventure, with scenes of forests, seas, and sky islands.
- **Characters:** A variety of characters, including the player's avatar, monsters that pose questions, and fairies that give hints, appear to liven up the story.

## 4. Color Palette

Centered around the header where the brand name is always displayed in the top-left corner, we adopt a pastel-toned color set conscious of soft, award-winning design. To ensure it remains lightweight for SSR on Cloudflare Workers, it is defined as CSS custom properties and referenced from Tailwind's arbitrary value classes.

| Token                 | HEX                         | Role/Usage                                                                          |
| :-------------------- | :-------------------------- | :---------------------------------------------------------------------------------- |
| `--mq-bg`             | `#f4f7fb`                   | Overall background. Ample whitespace and a clear blue-gray create a calm feel.      |
| `--mq-ink`            | `#1f2a4a`                   | Base text color. A deep navy ensures readability with a softer contrast than black. |
| `--mq-surface`        | `rgba(255, 255, 255, 0.85)` | Glassmorphism-style card background. The base color for headers and various cards.  |
| `--mq-surface-strong` | `#ffffff`                   | Main card surface. Applied to focus areas and form borders.                         |
| `--mq-primary`        | `#78c2c3`                   | Primary actions. Used for the start button and important navigation.                |
| `--mq-primary-strong` | `#4fa2b1`                   | Emphasis color for hover/focus states.                                              |
| `--mq-primary-soft`   | `#d8eef1`                   | Highlight for info cards and selected states.                                       |
| `--mq-secondary`      | `#f6d6c5`                   | Auxiliary alert/description areas. A soft sand beige adds warmth.                   |
| `--mq-accent`         | `#b4d7ee`                   | Gradient accent. A light blue adds a sense of excitement during learning.           |
| `--mq-outline`        | `rgba(120, 194, 195, 0.45)` | Borders/rings. Defines panel outlines without being too assertive.                  |

The entire palette, combining "pale blue tones + ice green + warm neutrals," creates a tone and manner that allows children to focus on learning with peace of mind, while also feeling high-quality to adults.

## 5. Gamification Elements

To enhance learning motivation, the following gamification elements are introduced:

| Element           | Specific Design                                                                                                                            |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Level System**  | Gain experience points to level up. Leveling up unlocks new stages and features.                                                           |
| **Points/Coins**  | Earned by answering questions correctly. Collected points can be exchanged for avatar dress-up items and useful adventure items.           |
| **Badges/Titles** | An achievement system where titles like "Addition Master" or "Multiplication Tables Master" can be earned by clearing specific conditions. |
| **Collection**    | Monsters and characters met in the game are registered in an "encyclopedia." Provides the fun of completing a collection.                  |
| **Rankings**      | An optional feature to compete with friends for high scores and clear times on each stage.                                                 |

By combining these elements, we build a system that encourages children to continue learning voluntarily.
