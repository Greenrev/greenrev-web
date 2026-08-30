# SarkinMota - Luxury Automotive Concierge

SarkinMota is a highly-polished, premium web application designed to serve as an exclusive global concierge for high-net-worth automotive enthusiasts. Built with modern web technologies, it features an "Awwwards-level" aesthetic characterized by deep cinematic themes, advanced scroll-based animations, and sophisticated typography.

## Key Features

- **AI-Powered Concierge**: A custom conversational interface built with the Vercel AI SDK and OpenRouter (Llama 3 70B). It replaces traditional search bars with an intelligent assistant that helps users find their exact specification or compare hypercars, complete with streaming responses and high-fidelity diagnostic UI elements.
- **Cinematic Landing Experience**: 
  - **Global Presence**: A seamless, infinite vertical ticker highlighting global delivery hubs, overlaid on a looping globe video with deep `<motion.div>` parallax effects.
  - **Awwwards Sticky Scroll**: A custom "Why SarkinMota" section that maps deep vertical scrolling to a sleek horizontal timeline track, unveiling massive feature panels.
- **Dynamic Inventory & Shop**: A deeply interactive vehicle catalog featuring popular high-end African market vehicles (G-Wagons, Land Cruisers, Range Rovers). The shop includes color filtering and leads to detailed specification pages.
- **Awwwards-Level Footer**: A premium, architectural grid footer with magnetic hover interactions (`framer-motion`), ultra-fine borders, and a massive screen-spanning typography CTA.
- **Light-Theme Testimonials**: Air-light cards with deep, dispersed drop shadows that elevate on hover, offset by massive watermark quotations, creating beautiful contrast against the site's primarily dark theme.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) + [OpenRouter](https://openrouter.ai/)
- **Typography**: Custom `bauserif` font integration.

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sarkinmota.git
   cd sarkinmota
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app`: Next.js 14 App Router pages (`layout.tsx`, `page.tsx`, etc.)
- `/src/components`: Reusable UI modules sorted by domain:
  - `/home`: Homepage specific sections (`AICarMatch.tsx`, `GlobalPresence.tsx`, `WhySarkinMota.tsx`, `Testimonials.tsx`)
  - `/layout`: Structural components (`Navbar.tsx`, `Footer.tsx`)
- `/src/app/api`: Serverless API routes, including the `/chat` route for the AI concierge.
- `/src/data`: Static JSON data serving as the inventory database.

## Design Philosophy

The aesthetic of SarkinMota is driven by strict design principles:
- **Depth**: Extensive use of `framer-motion` for parallax arrays and complex multi-layer scroll tracking.
- **Contrast**: Deep blacks (`#000000`, `#020202`) set against pristine whites and metallic gold accents (`#C7A43D`).
- **Typography-First**: Removing heavy UI containers and letting massive, elegant typefaces define the structure of the page.
- **Micro-Interactions**: Magnetic links, pulsing indicators, and smooth 700ms timing functions to ensure every hover state feels expensive and intentional.

## License

All rights reserved to SarkinMota.
