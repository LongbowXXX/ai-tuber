# AI V-Tuber System - Copilot Instructions

## Project Overview

This is a modular AI V-Tuber system composed of three main packages:

1.  **`vtuber-behavior-engine`**: The "Brain" (Python). Uses Google ADK for multi-agent orchestration, generating dialogue, emotions, and behavior.
2.  **`stage-director`**: The "Hub" (Python). A FastAPI & MCP server that orchestrates commands, manages WebSocket connections, and queues actions.
3.  **`vtube-stage`**: The "Body" (TypeScript/React). A Three.js frontend that renders the VRM avatar and executes commands (speak, move, expression).

## Architecture & Data Flow

- **Control Flow**: `vtuber-behavior-engine` (MCP Client) -> `stage-director` (MCP Server) -> WebSocket -> `vtube-stage`.
- **Communication**:
  - **MCP (Model Context Protocol)**: Used between the Behavior Engine and Stage Director.
  - **WebSocket**: Used between Stage Director and VTube Stage for real-time control.
  - **JSON Schemas**: Defined in `stage-director/src/stage_director/models.py` and mirrored in `vtube-stage/src/types/command.ts`.

## Package-Specific Instructions

### 1. `vtuber-behavior-engine` (Python)

- **Framework**: Google ADK (Agent Development Kit).
- **Key Files**:
  - `src/vtuber_behavior_engine/main.py`: Entry point.
  - `src/vtuber_behavior_engine/stage_agents/`: Agent definitions.
- **Conventions**:
  - Use `uv` for dependency management (`uv sync`, `uv run`).
  - Logs must go through `utils/logger.setup_logger`.
  - State keys are defined in `stage_agents/agent_constants.py`. Reuse existing keys.
  - Use `StageDirectorMCPClient` to send commands to the stage.

### 2. `stage-director` (Python)

- **Framework**: FastAPI, MCP (Model Context Protocol).
- **Key Files**:
  - `src/stage_director/main.py`: Runs both FastAPI and MCP servers.
  - `src/stage_director/command_queue.py`: Manages the async command queue.
  - `src/stage_director/models.py`: **Source of Truth** for command schemas.
- **Conventions**:
  - **Always** update `models.py` first when adding new commands.
  - Queue operations must be `await`ed.
  - WebSocket JSON keys are case-sensitive (camelCase).

### 3. `vtube-stage` (TypeScript/React)

- **Framework**: React 19, Vite, Three.js (`@react-three/fiber`, `@pixiv/three-vrm`).
- **Key Files**:
  - `src/hooks/useStageCommandHandler.ts`: Handles incoming WebSocket commands.
  - `src/components/VRMAvatar.tsx`: Manages the VRM model and animations.
- **Conventions**:
  - Use `npm` for package management.
  - Styles: `styled-components` or CSS modules.
  - Linting: `eslint` and `prettier`.
  - Ensure types in `src/types/` match the Python backend models.

## Development Workflow

- **Python Setup**:
  ```bash
  uv venv
  uv sync --extra dev
  source .venv/bin/activate  # or .venv\Scripts\activate
  ```
- **Frontend Setup**:
  ```bash
  npm install
  npm run dev
  ```
- **Running the System**:
  1.  Start `stage-director` (Hub).
  2.  Start `vtube-stage` (Frontend).
  3.  Start `vtuber-behavior-engine` (Brain).

## Critical Rules

1.  **Schema Consistency**: When modifying command structures, update `stage-director/models.py` AND `vtube-stage/src/types/` simultaneously.
2.  **Async/Await**: Python code is heavily async. Ensure proper `await` usage, especially in queue management and MCP handlers.
3.  **Environment Variables**: Use `.env` files. Python services use `python-dotenv`.
4.  **Testing**:
    - Python: `pytest` (asyncio fixtures enabled).
    - Frontend: `tsc -b` for type checking.
