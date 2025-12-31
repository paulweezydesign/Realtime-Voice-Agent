# Design Development Agency - AI-Powered Platform

A comprehensive multi-agent design and development agency platform built with Mastra.ai, Next.js 15, and MongoDB.

## 🌟 Features

- **7 Specialized AI Agents**:
  - 🎯 Project Manager - Orchestrates all agents and manages project lifecycle
  - 🔍 Deep Research Agent - Competitive analysis and requirements gathering
  - 🎨 Design Agent - UI/UX design, wireframing, and design systems
  - ⚛️ Frontend Agent - React/Next.js component development
  - 🔧 Backend Agent - API routes and database operations
  - ✅ QA Agent - Code review, testing, and quality assurance
  - 🤝 Client Acquisition Agent - Lead qualification and onboarding

- **Workflow Orchestration**: Automated project lifecycle management
- **Agent Networking**: Collaborative decision-making between agents
- **MongoDB Persistence**: Full data persistence and event sourcing
- **Real-time Dashboard**: Monitor projects, workflows, and agent activity
- **Human-in-the-Loop**: Approval gates for quality control

## 🚀 Tech Stack

- **Framework**: Next.js 15 (React 19, App Router, Server Components)
- **AI Framework**: Mastra.ai
- **Database**: MongoDB
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Language**: TypeScript
- **AI Models**: OpenAI GPT-4 / Anthropic Claude

## 📦 Installation

1. Clone the repository
2. Navigate to the design-agency directory:
   ```bash
   cd design-agency
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

5. Configure your `.env.local` file with:
   - MongoDB connection string
   - OpenAI API key
   - Anthropic API key (optional)

6. Start MongoDB (if running locally):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally: https://www.mongodb.com/docs/manual/installation/
   ```

7. Run the development server:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
design-agency/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── agents/        # Agent endpoints
│   │   ├── projects/      # Project management
│   │   ├── workflows/     # Workflow triggers
│   │   └── clients/       # Client management
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard-specific components
├── mastra/               # Mastra.ai configuration
│   ├── agents/           # AI agent definitions
│   ├── tools/            # Agent tools
│   ├── workflows/        # Workflow definitions
│   └── index.ts          # Mastra instance
├── lib/                  # Utility functions
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # General utilities
├── models/               # Data models & schemas
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔧 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## 🚢 Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy!

For MongoDB, we recommend using [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for production.

## 📖 Documentation

- [Mastra.ai Documentation](https://docs.mastra.ai)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🤝 Contributing

This is a proprietary project. For questions or issues, contact the development team.

## 📝 License

All rights reserved.

---

Built with ❤️ using Mastra.ai, Next.js, and MongoDB

