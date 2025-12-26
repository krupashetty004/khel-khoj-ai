# Khel-Khoj AI

### Project Overview
**Khel-Khoj AI (Game Search)** is an AI-powered platform designed to identify and analyze athletic talent in rural India.  
Coaches can upload videos of athletes, and the system uses computer vision and generative AI to evaluate biomechanics, agility, and performance to generate detailed scouting reports.  
This project integrates **Next.js**, **Node.js**, **FastAPI**, **MongoDB**, **Firebase**, **YOLO**, and **Gemini AI** to form a full-stack AI sports analysis platform.

---

## 📚 Complete Project Guide

**For a detailed, non-technical explanation of how everything works, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)**

This guide explains:
- What each part of the system does (in simple terms)
- How all components work together
- Step-by-step instructions to run the project
- How to use the video analysis pipeline
- Troubleshooting common issues

---

### Mandatory Core Requirements

#### 1. Documentation
For every step of this project:
- Maintain this README.md file as a weekly log of learning and progress.  
- Add a short summary at the end of each week describing what was learned, problems solved, and highlights.

#### 2. Version Control (Git & GitHub)
- Create a **new branch for each Phase** (e.g., `phase-0`, `phase-1`).
- Commit frequently with descriptive messages such as:
  - `Feat: Implement video upload component`
  - `Fix: Correct pose estimation logic`
- Push to GitHub **daily** for version tracking and visibility.

#### 3. Screen Recordings
At the completion of every major phase:
- Record a short **2–5 minute video** showing:
  - What was built  
  - Key technical concepts used  
  - Challenges solved and takeaways

---

### Weekly Progress Summary

#### Week 1 (Oct 18 – Oct 25)

**Goal:** Complete *Phase 0: Full-Stack Foundations*

**Completed Tasks:**
- ✅ Installed core tools: **Python**, **Node.js**, **Git**, **Docker Desktop**, **VS Code**
- ✅ Created GitHub repository **`khel-khoj-ai`**
- ✅ Learned Git commands: `init`, `add`, `commit`, `push`, `branch`
- ✅ Practiced branching (`main → dev`) and merging
- ✅ Added and pushed `vision.md` describing how AI could help discover hidden rural sports talent
- ✅ Created a static **“Player of the Week”** page using semantic HTML and CSS
- ✅ Integrated **Tailwind CSS** for rapid, responsive UI design
- ✅ Rebuilt the “Player of the Week” page using Tailwind and made it fully responsive
- ✅ Updated featured athlete to **Virat Kohli**

**HTML Page Preview:**
- Displays player image, name, sport, and description
- Uses Tailwind CSS classes for responsive scaling
- Centers content with adaptive spacing for all screen sizes

**Snippet:**
```html
<p class="mt-3 text-gray-700 text-sm sm:text-base leading-relaxed">
  Renowned for his sharp focus and precise timing, Virat displays exceptional batting consistency and leadership on the field.
</p>
