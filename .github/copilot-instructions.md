<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vibe Editor - Copilot Instructions

This is a desktop code editor project built with Electron, React, and TypeScript. The goal is to create a VS Code-like editor with integrated AI features.

## Project Architecture

- **Main Process** (`src/main/`): Electron main process handling system operations, file I/O, and terminal management
- **Renderer Process** (`src/renderer/`): React application with Redux state management
- **Components**: Modular React components following VS Code UI patterns
- **Store**: Redux Toolkit slices for state management

## Key Technologies

- Electron 27+ for desktop app framework
- React 18 with TypeScript for UI
- Redux Toolkit for state management
- Monaco Editor for code editing
- XTerm.js for terminal emulation
- Styled Components for styling

## Code Patterns

- Use functional React components with hooks
- Implement Redux actions with Redux Toolkit
- Follow VS Code naming conventions for UI elements
- Use TypeScript interfaces for all data structures
- Implement proper error handling and loading states

## AI Integration Goals

- ChatGPT integration with OAuth authentication
- GitHub Copilot support for code completion
- Secure token management
- Real-time AI assistance

## Development Priorities

1. Core editor functionality (file operations, syntax highlighting)
2. Terminal integration with multi-tab support
3. AI panel with chat interface
4. File explorer with tree view
5. Theme system and customization
6. Build and packaging for Windows/Linux

## Code Style

- Use ES6+ features and async/await
- Prefer composition over inheritance
- Keep components focused and single-responsibility
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
