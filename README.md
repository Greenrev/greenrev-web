# GreenRev - Web Platform

GreenRev is a highly-polished, premium automotive ecosystem designed to connect luxury vehicle buyers with independent vehicle dealers, automotive parts vendors, and expert mechanics. Built with modern web technologies, it features an "Awwwards-level" aesthetic characterized by deep cinematic themes, advanced scroll-based animations, and sophisticated typography.

## Key Features

- **Comprehensive Automotive Ecosystem**: A unified platform featuring four distinct, role-based experiences: 
  - **Client**: Browse premium vehicles, purchase parts, and book expert care.
  - **Vendor**: Manage vehicle and parts inventory, receive direct inquiries, and track analytics.
  - **Mechanic / Expert**: Receive service bookings, showcase shop capabilities, and integrate into the global map.
  - **Admin**: Oversee the entire marketplace, manage users, and monitor telemetry.

- **Cinematic Landing Experience**: 
  - **Frame-Perfect Canvas Animation**: A high-performance, butter-smooth scroll sequence powering the hero section, completely bypassing standard DOM lag for an uncompromised luxury feel.
  - **Awwwards Sticky Scroll**: Deep vertical scrolling mapped to a sleek horizontal timeline track, unveiling massive feature panels.

- **Interactive Showroom & Parts Boutique**: 
  - A deeply interactive catalog with advanced client-side filtering (by manufacturer, color, price range, and year).
  - High-fidelity inventory cards with dynamic hover states and quick-compare functionality.

- **Global Expert Network (Map Integration)**:
  - An interactive, dark-themed geographic interface allowing users to find and book certified mechanics worldwide using pulsing radar aesthetics.

- **Real-Time Communication**: 
  - Integrated WebSocket-based chat system allowing direct negotiation and communication between clients and vendors or mechanics.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context (Auth, Cart, Compare, Sockets)
- **Maps**: `@react-google-maps/api`
- **Typography**: Custom `bauserif` and `ClashDisplay` font integrations.

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) installed and that the **GreenRev Backend Server** is running on your machine (default: `http://localhost:4000`).

### Installation

1. Navigate to the client directory:
   ```bash
   cd greenrev-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` (or `.env.local`) file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## Design Philosophy

The aesthetic of GreenRev is driven by strict design principles:
- **Depth**: Extensive use of `framer-motion` for parallax arrays and complex multi-layer scroll tracking.
- **Contrast**: Deep blacks (`#000000`, `#050505`) set against pristine whites and metallic gold/accent details (`#C7A43D`).
- **Typography-First**: Removing heavy UI containers and letting massive, elegant typefaces define the structure of the page.
- **Micro-Interactions**: Magnetic links, pulsing indicators, and smooth timing functions to ensure every hover state feels expensive and intentional.

## License

All rights reserved to GreenRev.
