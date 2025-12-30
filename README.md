# AI Financial Causal Terminal

A predictive financial intelligence system that forecasts future events impacting stock prices using causal models, probabilistic reasoning, and graph-based analysis.

## Features

- **Event Prediction**: Generate future events (macro, industry, company-specific) with explicit probabilities
- **Causal Graph Visualization**: Display events as a DAG showing causal relationships
- **Bayesian Updating**: Dynamically adjust probabilities as new signals arrive
- **Financial Analysis**: Automatically detect anomalies in financial metrics
- **Social Sentiment Integration**: Incorporate Twitter/X and Reddit data as probabilistic signals
- **Interactive AI Chat**: Enable counterfactual reasoning and scenario exploration

## Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **UI**: Shadcn/ui components with TailwindCSS
- **Visualization**: Recharts, React Flow
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Testing**: fast-check for property-based testing

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Supabase account (for database and real-time features)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up Supabase:
   - Create a project at [https://app.supabase.com](https://app.supabase.com)
   - Copy your project URL and anon key
   - Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

- Add your Supabase credentials to `.env.local`

3. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
bloomberg-terminal/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
│   ├── panels/      # Main panel components
│   ├── ui/          # Reusable UI components
│   └── charts/      # Chart and visualization components
├── lib/             # Utility functions and business logic
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Design Tokens

The application uses custom design tokens for financial data visualization:

- **Bullish Green**: `oklch(0.65 0.18 145)` - Positive/upward trends
- **Bearish Red**: `oklch(0.6 0.25 25)` - Negative/downward trends
- **Neutral Amber**: `oklch(0.75 0.18 85)` - Neutral/uncertain trends

## Documentation

For detailed requirements and design documentation, see:

- [Requirements](../Telegram/.kiro/specs/ai-financial-terminal/requirements.md)
- [Design](../Telegram/.kiro/specs/ai-financial-terminal/design.md)
- [Tasks](../Telegram/.kiro/specs/ai-financial-terminal/tasks.md)

## License

Private project - All rights reserved
