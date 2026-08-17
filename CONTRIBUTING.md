# Contributing to Eleven.2

## Project Structure

This project is a monorepo consisting of two main parts:
- **`frontend/`**: The React 19 + Vite + React Three Fiber application.
- **`backend/`**: The Node.js + Express Backend-For-Frontend (BFF) server.

## Local Development Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A [Groq API Key](https://console.groq.com/) for the AI mission intelligence feature.

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/AkhileshPachnanda/Eleven.2_ISRO-Fleet-Tracking-Orbital-Analytics.git
   cd Eleven.2_ISRO-Fleet-Tracking-Orbital-Analytics
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   GROQ_API_KEY=your_api_key_here
   PORT=3001
   ```
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:3001
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

## Running Tests

We use **Vitest** for both the frontend and backend. 

- **Frontend tests**: `cd frontend && npm test`
- **Backend tests**: `cd backend && npm test`

Please ensure all tests pass before submitting a Pull Request. If you are adding a new feature, please add corresponding tests in the `src/tests` directory.

## Pull Request Process

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## Code Style

- We use standard ES6 syntax.
- Please avoid adding inline comments unless absolutely necessary for complex logic (we prefer clean, self-documenting code).
- Keep React components focused. If a file gets too large, abstract the logic into custom hooks in `frontend/src/hooks/`.

## Reporting Issues

If you find a bug or have a feature request, please use the GitHub Issues tab. Provide as much detail as possible, including OS, browser version, and steps to reproduce.
