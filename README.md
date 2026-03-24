# Happy Programming

A dark, futuristic React + Vite website for Happy Programming — a programming and AI training school for high school students.

## Tech Stack

- **React 18** — component-based UI
- **Vite 5** — fast dev server & bundler
- **CSS Modules** — scoped, component-level styles
- **Google Fonts** — Orbitron (headings) + Space Grotesk (body)

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component, scroll observer
├── index.css             # Global styles & CSS variables
└── components/
    ├── Navbar.jsx / .module.css
    ├── Hero.jsx / .module.css
    ├── Courses.jsx / .module.css
    ├── Pricing.jsx / .module.css
    ├── PrivateLessons.jsx / .module.css
    ├── About.jsx / .module.css
    ├── Testimonials.jsx / .module.css
    ├── FAQ.jsx / .module.css
    ├── Contact.jsx / .module.css
    └── Footer.jsx / .module.css
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization

All design tokens (colors, spacing) are in `src/index.css` under `:root`.

Key values:

- `--cyan: #00F5FF` — primary accent
- `--purple: #9B5DFF` — secondary accent
- `--pink: #FF2D9B` — tertiary accent
- `--green: #00FF88` — success / beginner badge
- `--bg: #060612` — page background
- `--surface: #0D0D22` — section background (alternating)
- `--card: #11112A` — card background

## Sections

1. **Hero** — animated glow + code terminal visual
2. **Courses** — 4 course cards with gradient top borders
3. **Pricing** — 3 tier cards (Starter / Academy / Private)
4. **Private Lessons** — mentor card + booking CTA
5. **About** — features list + stats grid
6. **Testimonials** — 3 student quote cards
7. **FAQ** — interactive accordion (React state)
8. **Contact** — form with success state
9. **Footer**
# frontend
