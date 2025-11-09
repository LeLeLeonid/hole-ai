# HOLE-AI: An Experimental Generative Narrative Engine

![Screenshot_of the Menu](https://github.com/user-attachments/assets/84df2e9e-a37c-42e6-8ba2-d81a1a824d2c)


HOLE-AI is an experimental engine for creating dynamic, text-based interactive fiction, powered by the Google Gemini API. It moves beyond traditional branching narratives by leveraging a large language model to generate a responsive, persistent, and endlessly variable world in real-time, all rendered with a minimalist ASCII/Unicode aesthetic.

---

## Core Concept: The Narrative Bias System

Traditional RPGs rely on pre-written content and static NPC personalities. HOLE-AI introduces a **"Narrative Bias"** system to create truly dynamic and replayable experiences.

At the start of a session, a core philosophical directive is injected into the root prompt, subtly coloring the entire generated reality—from NPC motivations to environmental descriptions and quest objectives. This creates fundamentally different gameplay experiences from the same player input, making each playthrough a unique exploration of the underlying theme.

The two primary directives currently implemented are:
-   **The Keeper:** A bias towards the preservation of humanity, tradition, and biological limitations.
-   **The Synthesizer:** A bias towards technological evolution, transcendence, and post-humanism.

![Screenshot of the core choice mechanic in HOLE-AI](https://github.com/user-attachments/assets/3b3ef42d-6f83-4c44-b7eb-d4e74f62c085)


## Key Features

-   **Procedural Narrative Generation:** The story is created on-the-fly by the LLM, ensuring no two playthroughs are identical.
-   **Persistent World State:** The engine maintains a memory of player actions and world events, leading to coherent and reactive NPC behavior.
-   **Dynamic Thematic Alignment:** The core "Narrative Bias" system ensures a deep, underlying theme shapes the entire experience.
-   **Minimalist Terminal Aesthetic:** A clean, retro-inspired interface using ASCII/Unicode characters to prioritize narrative immersion.

## Technology Stack

-   **Frontend:** TypeScript, Vite
-   **AI Core:** Google Gemini API
-   **State Management & Logic:** TypeScript

## Getting Started

To run this project locally, you will need to provide your own Google AI Studio API key.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LeLeLeonid/hole-ai.git
    ```
2.  **Navigate to the project directory and install dependencies:**
    ```bash
    cd hole-ai
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  **Configure the API Key:**
    Open the .env.local to enter your Google AI Studio API key.

## Project Roadmap

This project is an active exploration. Future development is focused on:

-   [ ] Implementing more complex and nuanced Narrative Bias directives.
-   [ ] Enhancing the state management system for long-term memory and character development.
-   [ ] Developing a more robust UI for managing game state and narrative branches.
-   [ ] Exploring methods for player-defined scenario and character creation.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
