# Mastra Multi-Agent Development Agency

A powerful multi-agent AI system built with [Mastra.ai](https://mastra.ai) that simulates a complete software development agency with specialized agents for different aspects of software development.

## 🤖 Agent Team

The agency consists of 7 specialized AI agents coordinated by a Project Manager:

### 1. **Project Manager** (Supervisor)
- Coordinates all other agents
- Breaks down complex projects into tasks
- Delegates work to specialized agents
- Aggregates results and makes decisions
- Main entry point for all interactions

### 2. **Deep Research Agent**
- Technology research and evaluation
- Documentation analysis
- Best practices investigation
- Market and competitive analysis
- Provides evidence-based recommendations

### 3. **Design Agent**
- UI/UX design specifications
- Component architecture
- Design system guidelines (TailwindCSS + shadcn/ui)
- Accessibility planning
- Responsive design strategies

### 4. **Frontend Agent**
- React 19 development
- Next.js 15 implementation
- TypeScript components
- Client-side logic
- Functional programming patterns

### 5. **Backend Agent**
- API routes and server actions
- Business logic implementation
- Database design
- Authentication & authorization
- Security best practices

### 6. **QA Agent**
- Code review and analysis
- Quality assessment
- Security vulnerability identification
- Performance evaluation
- Best practices validation
- Note: Reviews code, doesn't write tests

### 7. **Client Acquisition Team**
- Proposal creation
- Client onboarding materials
- Presentation development
- Business development support
- Market research

## 🛠️ Tech Stack

- **Framework**: [Mastra.ai](https://mastra.ai) - TypeScript AI framework
- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Language Model**: Flexible provider support via `@ai-sdk/openai-compatible`
  - HuggingFace
  - OpenRouter
  - Vercel AI Gateway
  - XAI (Grok)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Voice**: ElevenLabs (for existing chat agent)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API key for one of the supported LLM providers

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Realtime-Voice-Agent
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Copy `.env.example` to `.env` and configure ONE of the following providers:

**Option 1: Vercel AI Gateway (Recommended for production)**
```env
AI_GATEWAY_URL=https://your-gateway.vercel.app/v1
AI_GATEWAY_KEY=your-gateway-key
AI_GATEWAY_MODEL=gpt-4o-mini
```

**Option 2: OpenRouter**
```env
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Option 3: HuggingFace**
```env
HF_API_KEY=your-huggingface-key
HF_BASE_URL=https://api-inference.huggingface.co/v1
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

**Option 4: XAI (Grok)**
```env
XAI_API_KEY=your-xai-api-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000/agency](http://localhost:3000/agency) to access the agency interface

## 📁 Project Structure

```
src/
├── app/
│   ├── agency/              # Agency interface page
│   ├── api/
│   │   └── agency/          # Agency API routes
│   │       ├── chat/        # Chat with project manager
│   │       └── agents/      # List available agents
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AgencyInterface.tsx  # Main agency UI
│   ├── ChatInterface.tsx    # Voice chat UI (existing)
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── model-config.ts      # LLM provider configuration
│   └── model-provider.ts    # Provider factory
├── mastra/
│   ├── agents/              # All agent definitions
│   │   ├── project-manager.ts
│   │   ├── deep-research.ts
│   │   ├── design.ts
│   │   ├── frontend.ts
│   │   ├── backend.ts
│   │   ├── qa.ts
│   │   └── client-acquisition.ts
│   ├── tools/               # Inter-agent communication tools
│   │   ├── delegate-to-research.ts
│   │   ├── delegate-to-design.ts
│   │   ├── delegate-to-frontend.ts
│   │   ├── delegate-to-backend.ts
│   │   ├── delegate-to-qa.ts
│   │   └── delegate-to-client-team.ts
│   └── index.ts             # Mastra instance configuration
└── store/
    └── chatStore.ts         # Global state management
```

## 🎯 How It Works

### Hierarchical Multi-Agent System

The system uses a **supervisor pattern** where the Project Manager coordinates specialized agents:

1. **User interacts** with the Project Manager through the web interface
2. **Project Manager analyzes** the request and determines which agents to involve
3. **Agents are delegated** tasks through specialized tools
4. **Each agent** performs its specialized work and returns results
5. **Project Manager aggregates** all results and provides a cohesive response
6. **User receives** a comprehensive solution coordinated across multiple agents

### Example Workflow

**User**: "Build a user dashboard with authentication"

**Project Manager**:
1. Delegates to **Research Agent**: Best practices for dashboard design
2. Delegates to **Design Agent**: UI/UX specifications for dashboard
3. Delegates to **Backend Agent**: Authentication API routes
4. Delegates to **Frontend Agent**: Dashboard components
5. Delegates to **QA Agent**: Review all generated code
6. Aggregates everything into a cohesive implementation plan

## 🔧 Configuration

### Switching LLM Providers

The system automatically detects which provider is configured based on environment variables. Priority order:

1. Vercel AI Gateway (`AI_GATEWAY_URL` + `AI_GATEWAY_KEY`)
2. OpenRouter (`OPENROUTER_API_KEY`)
3. HuggingFace (`HF_API_KEY`)
4. XAI (`XAI_API_KEY`)

### Customizing Agents

Each agent can be customized by editing its file in `src/mastra/agents/`. You can:

- Modify instructions and behavior
- Change the model used
- Add or remove tools
- Adjust capabilities

### Adding New Agents

1. Create a new agent file in `src/mastra/agents/`
2. Define the agent with instructions and model
3. Create delegation tools in `src/mastra/tools/`
4. Register the agent in `src/mastra/index.ts`
5. Add tool to Project Manager's toolset

## 📚 API Reference

### POST `/api/agency/chat`

Chat with the project manager agent.

**Request:**
```json
{
  "message": "Your request or question",
  "conversationId": "optional-conversation-id",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Agent response",
    "conversationId": "conversation-id",
    "toolCalls": []
  }
}
```

### GET `/api/agency/agents`

Get list of available agents and their capabilities.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "name": "projectManager",
        "description": "Coordinates all agents...",
        "capabilities": []
      }
    ]
  }
}
```

## 🧪 Development Principles

The codebase follows these principles:

- **Functional Programming**: Pure functions, immutability, composition
- **Type Safety**: Comprehensive TypeScript typing
- **Test-Driven Development**: Testable, predictable code
- **Modern React**: React 19, Server Components, Server Actions
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized renders, code splitting
- **Security**: Input validation, secure patterns

## 📖 Learn More

- [Mastra.ai Documentation](https://mastra.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [React 19 Documentation](https://react.dev)

## 🤝 Contributing

Contributions are welcome! Please follow the existing code patterns and ensure all agents follow functional programming principles.

## 📄 License

[Add your license here]

## 🎉 Features

- ✅ Multi-agent coordination with supervisor pattern
- ✅ Flexible LLM provider support (HuggingFace, OpenRouter, Vercel AI Gateway, XAI)
- ✅ Beautiful, responsive UI with TailwindCSS
- ✅ Type-safe with TypeScript
- ✅ Real-time chat interface
- ✅ Tool call visualization
- ✅ Functional programming patterns
- ✅ Production-ready architecture
- ✅ Extensible agent system

## 🔮 Future Enhancements

- [ ] Conversation history persistence
- [ ] Multiple concurrent project handling
- [ ] Agent performance metrics
- [ ] Visual workflow diagram
- [ ] File upload support
- [ ] Code artifact preview
- [ ] Collaborative editing
- [ ] WebSocket support for streaming responses

