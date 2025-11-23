# HOLE AI

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/built%20with-TypeScript%20%7C%20Vite%20%7C%20Gemini-blueviolet)

**HOLE-AI** is an experimental generative narrative engine driven by Large Language Models. Unlike traditional text-based RPGs with pre-written branches, HOLE-AI generates a responsive, persistent world in real-time, dynamically altering the narrative tone based on a core system parameter known as **"Narrative Bias."**

![Screenshot of the core choice mechanic](https://github.com/user-attachments/assets/3b3ef42d-6f83-4c44-b7eb-d4e74f62c085)

## Core Concept: Narrative Bias System

The engine injects a specific philosophical directive into the root prompt of the LLM at the start of the session. This directive acts as a filter, influencing NPC motivations, environmental descriptions, and quest outcomes.

The current version (v0.6) implements two opposing bias presets:
*   **The Keeper:** Biases generation towards organic themes, tradition, preservation of humanity, and biological limitations.
*   **The Synthesizer:** Biases generation towards technological acceleration, transhumanism, efficiency, and synthetic evolution.

## Key Features

*   **Real-Time Procedural Generation:** All narrative content is generated on-the-fly via Google Gemini API, ensuring unique playthroughs.
*   **Context-Aware Persistence:** The engine maintains a state memory of player actions, ensuring logical consistency in NPC interactions and world events.
*   **Dynamic Thematic Alignment:** The environment reacts to the chosen "Narrative Bias," altering the descriptive language and atmosphere.
*   **Terminal-First Aesthetic:** A minimalist, distraction-free UI designed to emulate legacy terminal interfaces using ASCII/Unicode elements.

## Technology Stack

*   **Frontend:** TypeScript, Vite
*   **AI Inference:** Google Gemini API
*   **State Management:** Custom TypeScript implementation

## Installation & Setup

To run HOLE-AI locally, you will need a valid API key from Google AI Studio.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LeLeLeonid/hole-ai.git
    ```

2.  **Install dependencies:**
    ```bash
    cd hole-ai
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

## Roadmap

This project is currently in active development (v0.6).

- [ ] **Advanced Bias Directives:** Implementation of more nuanced and mixed narrative weights.
- [ ] **Long-Term Memory:** Integration of vector-based memory for extended campaign coherence.
- [ ] **UI/UX Overhaul:** Improved state visualization and narrative branching controls.
- [ ] **Custom Scenarios:** Support for user-defined JSON scenario imports (Character Cards).

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
