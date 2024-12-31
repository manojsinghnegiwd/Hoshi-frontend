# Hoshi - AI Agent Platform

Hoshi is a modern web application built with Next.js that provides a platform for managing and interacting with AI agents. The platform allows users to create workspaces, configure AI agents, and extend their functionality through a flexible extension system.

## Features

- **Workspace Management**
  - Create and manage multiple workspaces
  - Organize AI agents within workspaces
  - Customizable workspace settings and configurations

- **AI Agents**
  - Create and configure AI agents
  - Real-time chat interface with agents
  - Thread-based conversations
  - Message history and context management

- **Extension System**
  - Modular extension architecture
  - Add/remove extensions to workspaces
  - Configure extension settings
  - Test extension functionality
  - Version control for extensions

- **Modern UI/UX**
  - Clean and intuitive interface
  - Responsive design
  - Dark/light theme support
  - Real-time updates
  - Smooth transitions and animations

## Tech Stack

- **Frontend Framework**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **State Management**: React Hooks
- **API Communication**: Fetch API
- **Type Safety**: TypeScript

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
├── lib/
│   └── services/         # API service layer
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   Copy .env.example to .env.local and configure your environment variables
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- The application uses a modern Next.js setup with the App Router
- Components are built using TypeScript and follow React best practices
- Styling is done using Tailwind CSS with a custom theme configuration
- The project follows a service-based architecture for API communication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Add your license information here]
