# AI-Powered Design Agency Platform

A comprehensive design development agency platform built with the Mastra.ai TypeScript framework, featuring 7 specialized AI agents that automate the entire project lifecycle from client acquisition to project delivery.

## 🚀 Features

### 7 Specialized AI Agents

1. **Project Manager Agent** 🎯
   - Central orchestrator for project lifecycle
   - Manages phase transitions and agent assignments
   - Tools: Create projects, update status, assign agents

2. **Deep Research Agent** 🔍
   - Competitor analysis with SWOT framework
   - Technical requirements gathering
   - Market research and insights
   - Tools: Analyze competitors, gather requirements, conduct research, create summaries

3. **Design Agent** 🎨
   - Wireframes and information architecture
   - Design systems (colors, typography, spacing)
   - High-fidelity mockups (desktop, tablet, mobile)
   - Tools: Create wireframes, design systems, mockups, component specs

4. **Frontend Agent** ⚛️
   - React 19 + Next.js 15 + TypeScript
   - shadcn/ui component implementation
   - Server Components by default
   - Tools: Generate components, implement pages

5. **Backend Agent** 🔧
   - Next.js API routes (App Router)
   - MongoDB schemas with Zod validation
   - RESTful API patterns
   - Tools: Create API routes, database schemas

6. **QA Agent** ✅
   - Code review (security, performance, best practices)
   - WCAG 2.1 AA accessibility testing
   - Tools: Review code, test accessibility

7. **Client Acquisition Agent** 💼
   - Lead qualification with scoring
   - Proposal generation
   - Client relationship management
   - Tools: Qualify leads, create proposals

### Automated Workflows

#### Project Lifecycle Workflow
6-step automated workflow orchestrating all agents:
1. Initialize Project
2. Research Phase
3. Design Phase
4. Development Phase
5. QA Phase
6. Review and Completion

#### Client Onboarding Workflow
3-step lead-to-project pipeline:
1. Qualify Lead
2. Create Proposal
3. Initialize Project

### RESTful API

- `/api/projects` - CRUD operations for projects
- `/api/projects/[id]` - Individual project management
- `/api/clients` - Client management
- `/api/agents/execute` - Execute agents with prompts
- `/api/workflows/execute` - Trigger workflow automation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **AI Framework**: Mastra.ai
- **Database**: MongoDB
- **Styling**: TailwindCSS v4
- **Components**: shadcn/ui
- **AI Model**: OpenAI GPT-4o
- **Validation**: Zod
- **Logging**: Pino

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- MongoDB instance
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd design-agency
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/design-agency
   
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
design-agency/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard UI
│   │   └── page.tsx          # Landing page
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utilities
│   │   └── mongodb.ts        # Database connection
│   └── types/                 # TypeScript types
├── mastra/                    # Mastra.ai configuration
│   ├── agents/               # AI agent definitions
│   ├── tools/                # Agent tools
│   ├── workflows/            # Workflow definitions
│   └── index.ts             # Mastra instance
├── scripts/
│   └── init-db.ts           # Database initialization
└── package.json
```

## 🎯 Usage

### Creating a New Project

**Via API:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Website",
    "description": "E-commerce website",
    "clientId": "client-id-here",
    "requirements": "User authentication, product catalog",
    "timeline": "8 weeks",
    "budget": "$50,000"
  }'
```

**Via Dashboard:**
1. Navigate to `/dashboard`
2. Click "New Project"
3. Fill in project details
4. Submit

### Executing an Agent

```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "deep-research",
    "prompt": "Analyze competitors for e-commerce platform",
    "projectId": "project-id-here"
  }'
```

### Triggering a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowName": "project-lifecycle",
    "triggerData": {
      "projectId": "new-project-id",
      "clientId": "client-id",
      "projectName": "E-commerce Platform",
      "requirements": "Full e-commerce solution"
    }
  }'
```

## 📊 Database Schema

### Collections

1. **projects** - Core project data
2. **tasks** - Individual work items
3. **clients** - Client information
4. **conversations** - Agent conversation history
5. **artifacts** - Generated outputs (designs, code, documents)
6. **events** - Event sourcing for audit trail
7. **executionLogs** - Agent execution tracking
8. **workflowExecutions** - Workflow execution history

See `types/index.ts` for complete schema definitions.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🧪 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🎨 Dashboard Features

- **Project Overview** - View all projects with status badges
- **Client Management** - Track and manage client relationships
- **Agent Status** - Monitor all 7 AI agents
- **Real-time Updates** - Live project status updates
- **Stats Dashboard** - Key metrics and KPIs

## 🤖 Agent Capabilities

### Project Manager
- Create and initialize projects
- Update project status
- Assign agents to projects
- Monitor project progress

### Deep Research
- Competitor analysis (SWOT)
- Requirements gathering
- Market research
- Research synthesis

### Design
- Wireframe creation
- Design system development
- High-fidelity mockups
- Component specifications

### Frontend
- React component generation
- Next.js page implementation
- Responsive design
- Accessibility compliance

### Backend
- API route creation
- Database schema design
- Business logic implementation
- Security best practices

### QA
- Code quality review
- Security vulnerability assessment
- Accessibility testing
- Performance optimization

### Client Acquisition
- Lead qualification and scoring
- Proposal generation
- Client relationship management
- Status tracking

## 📈 Roadmap

- [x] 7 specialized AI agents
- [x] Automated workflows
- [x] RESTful API
- [x] Dashboard UI
- [ ] Real-time updates (WebSockets)
- [ ] Comprehensive testing
- [ ] Deployment configurations
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Slack integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Mastra.ai](https://mastra.ai) Framework
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [OpenAI GPT-4o](https://openai.com)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ using Mastra.ai, Next.js, and TypeScript**

