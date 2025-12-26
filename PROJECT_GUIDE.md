# Khel-Khoj AI - Complete Project Guide
## A Simple Guide for Everyone

---

## 📖 What is This Project?

**Khel-Khoj AI** is a smart sports analysis system that can:
- Find and display information about athletes
- Analyze sports videos to detect player movements
- Calculate how fast athletes are moving
- Track body positions (like arms, legs, head) in videos

Think of it as a digital coach that watches videos and tells you about the athletes' performance!

---

## 🏗️ How Does It Work? (The Big Picture)

Imagine you have three assistants working together:

1. **The Frontend (Next.js)** - The "Face" of the application
   - This is what you see on your screen
   - Like a website where you can search for athletes
   - Shows you information in a nice, easy-to-read format

2. **The Backend (Express)** - The "Brain" that stores data
   - Keeps track of all athlete information
   - Stores data in a database (like a digital filing cabinet)
   - Provides information when you ask for it

3. **The AI Service (FastAPI)** - The "Smart Analyzer"
   - Watches videos and finds people in them
   - Tracks how bodies move
   - Calculates speed and other measurements
   - Does the heavy thinking work

---

## 🧩 The Three Main Parts Explained

### Part 1: Frontend (What You See)
**Technology:** Next.js (a modern website framework)
**Location:** `my-next-app/` folder
**What it does:**
- Creates the web pages you visit
- Shows athlete cards with photos and information
- Lets you search and browse athletes
- Makes everything look nice and user-friendly

**Simple Example:** Like a digital sports magazine where you can flip through pages of athletes.

---

### Part 2: Backend (The Data Manager)
**Technology:** Express.js (a server framework) + MongoDB (database)
**Location:** `backend/` folder
**What it does:**
- Stores athlete information (name, sport, bio, photos)
- Keeps everything organized in a database
- Provides a secure way to access data
- Handles user authentication (making sure only authorized people can access)

**Simple Example:** Like a librarian who knows where every book (athlete data) is stored and can fetch it for you.

**Key Features:**
- **Athlete Database:** Stores information about players
- **Firebase Authentication:** Security system to protect data
- **REST API:** A way for different parts of the system to talk to each other

---

### Part 3: AI Service (The Video Analyzer)
**Technology:** FastAPI (Python web framework) + Celery (task processor) + YOLO (AI model)
**Location:** `python-api/` folder
**What it does:**
- Takes sports videos as input
- Extracts frames (individual pictures) from videos
- Uses AI to detect people and their body positions
- Calculates movement speed
- Processes everything in the background so it doesn't slow down the system

**Simple Example:** Like a video analyst who watches game footage frame by frame and notes down every movement.

**The AI Pipeline:**
1. **Frame Extraction:** Takes a video and saves every 10th frame as a picture
2. **Pose Detection:** Uses AI to find people in each frame and mark their body parts (head, shoulders, arms, legs, etc.)
3. **Speed Calculation:** Measures how far a person moved between frames and calculates their speed

---

## 🔄 How Everything Works Together

```
User Opens Website
    ↓
Frontend (Next.js) displays athlete search page
    ↓
User searches for an athlete
    ↓
Frontend asks Backend (Express) for athlete data
    ↓
Backend checks database (MongoDB) and returns information
    ↓
Frontend displays the athlete information

---

User uploads a video for analysis
    ↓
Frontend sends video to AI Service (FastAPI)
    ↓
AI Service puts the job in a queue (Celery)
    ↓
Background worker processes the video:
    - Extracts frames
    - Detects poses using AI (YOLO)
    - Calculates speed
    ↓
Results are saved and sent back
    ↓
User sees the analysis results
```

---

## 🛠️ Technical Components Explained Simply

### 1. **Next.js (Frontend)**
- **What it is:** A framework for building websites
- **Why we use it:** Makes websites fast and easy to update
- **Like:** A template that helps build beautiful web pages quickly

### 2. **Express.js (Backend)**
- **What it is:** A server framework that handles requests
- **Why we use it:** Manages data and provides APIs
- **Like:** A waiter in a restaurant who takes your order and brings your food

### 3. **MongoDB (Database)**
- **What it is:** A database that stores information
- **Why we use it:** Keeps athlete data organized and easy to retrieve
- **Like:** A filing cabinet that stores all your documents

### 4. **FastAPI (AI Service)**
- **What it is:** A Python framework for building APIs
- **Why we use it:** Handles video processing and AI tasks
- **Like:** A specialized worker who does complex calculations

### 5. **Celery (Task Queue)**
- **What it is:** A system for processing tasks in the background
- **Why we use it:** Prevents the system from freezing while processing videos
- **Like:** A to-do list manager that processes tasks one by one

### 6. **Redis (Message Broker)**
- **What it is:** A fast data storage system
- **Why we use it:** Helps Celery manage tasks efficiently
- **Like:** A message board where tasks are posted and workers check it

### 7. **YOLO (AI Model)**
- **What it is:** An AI model that can detect objects and people
- **Why we use it:** Finds people in videos and tracks their body positions
- **Like:** A smart camera that can identify and track people automatically

### 8. **Firebase (Authentication)**
- **What it is:** Google's authentication service
- **Why we use it:** Securely manages user logins
- **Like:** A security guard who checks IDs before letting people in

---

## 📁 Project Structure (What's in Each Folder)

```
khel-khoj-ai/
│
├── my-next-app/          # The website (what users see)
│   ├── src/
│   │   ├── app/          # Web pages
│   │   └── components/   # Reusable UI pieces
│   └── package.json      # List of required tools
│
├── backend/              # The data manager
│   ├── src/
│   │   ├── models/       # Data structures (what athlete info looks like)
│   │   ├── controllers/  # Logic for handling requests
│   │   ├── routes/       # URL endpoints (like /api/athletes)
│   │   └── server.js     # Main server file
│   └── package.json      # List of required tools
│
├── python-api/           # The AI analyzer
│   ├── video_input/      # Where videos are placed
│   ├── frames/           # Extracted video frames
│   ├── pose_data/        # AI analysis results
│   ├── main.py           # FastAPI server
│   ├── tasks.py           # Background job definitions
│   └── extract_frames.py # Video processing script
│
└── README.md             # This file!
```

---

## 🚀 How to Run the Project (Step-by-Step)

### Prerequisites (What You Need First)

1. **Node.js** (version 18 or higher)
   - **What it is:** Software that runs JavaScript
   - **How to get it:** Download from nodejs.org
   - **Why you need it:** Powers the frontend and backend

2. **Python** (version 3.10 or higher)
   - **What it is:** Programming language for the AI service
   - **How to get it:** Download from python.org
   - **Why you need it:** Runs the video analysis scripts

3. **MongoDB Atlas Account** (Free tier works)
   - **What it is:** Cloud database service
   - **How to get it:** Sign up at mongodb.com/cloud/atlas
   - **Why you need it:** Stores athlete data

4. **Firebase Project**
   - **What it is:** Google's authentication service
   - **How to get it:** Create at console.firebase.google.com
   - **Why you need it:** Handles user security

5. **Docker Desktop** (Optional but recommended)
   - **What it is:** Software for running Redis easily
   - **How to get it:** Download from docker.com
   - **Why you need it:** Runs Redis for background tasks

---

### Step 1: Start Redis (The Task Manager)

**Option A: Using Docker (Easiest)**
```powershell
docker run -d --name redis-local -p 6379:6379 redis
```
**What this does:** Starts Redis in a container on port 6379

**Option B: Install Redis Locally**
- Download Redis for Windows
- Run `redis-server.exe`

---

### Step 2: Start the Frontend (The Website)

1. Open a PowerShell or Command Prompt window
2. Navigate to the project folder:
   ```powershell
   cd C:\Users\Admin\Desktop\khel-khoj-ai\my-next-app
   ```
3. Install dependencies (first time only):
   ```powershell
   npm install
   ```
4. Start the server:
   ```powershell
   npm run dev
   ```
5. You'll see: `Ready on http://localhost:3000`
6. Open your browser and go to: **http://localhost:3000**

**What's happening:** The website is now running and you can see it in your browser!

---

### Step 3: Start the Backend (The Data Manager)

1. Open a **NEW** PowerShell window
2. Navigate to the backend folder:
   ```powershell
   cd C:\Users\Admin\Desktop\khel-khoj-ai\backend
   ```
3. Install dependencies (first time only):
   ```powershell
   npm install
   ```
4. Set up your environment file:
   - Open `backend/.env` file
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
     ```
   - Add your Firebase project ID (already set if you followed setup)
5. Start the server:
   ```powershell
   npm run dev
   ```
6. You'll see: `Server running at http://localhost:4000`

**What's happening:** The backend is now ready to serve data!

---

### Step 4: Start the AI Service (The Video Analyzer)

1. Open a **NEW** PowerShell window
2. Navigate to the python-api folder:
   ```powershell
   cd C:\Users\Admin\Desktop\khel-khoj-ai\python-api
   ```
3. Activate the virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   (You should see `(.venv)` appear in your prompt)
4. Start the Celery worker (for background tasks):
   ```powershell
   celery -A tasks worker --loglevel=info
   ```
5. Open a **FOURTH** PowerShell window
6. Navigate to python-api again and activate venv:
   ```powershell
   cd C:\Users\Admin\Desktop\khel-khoj-ai\python-api
   .\.venv\Scripts\Activate.ps1
   ```
7. Start the FastAPI server:
   ```powershell
   python -m uvicorn main:app --reload --port 8000
   ```
8. You'll see: `Application startup complete`
9. Visit: **http://localhost:8000/docs** for API documentation

**What's happening:** The AI service is ready to analyze videos!

---

### 🎯 Quick Start (All Services at Once)

We've created a script to start everything automatically:

1. Open PowerShell in the project root:
   ```powershell
   cd C:\Users\Admin\Desktop\khel-khoj-ai
   ```
2. Run the startup script:
   ```powershell
   .\start_project.ps1
   ```
3. This will open separate windows for each service!

---

## 🎬 Using the Video Analysis Pipeline

### Step 1: Prepare Your Video
1. Place your video file in: `python-api/video_input/sample.mp4`
2. Supported formats: MP4, AVI, MOV (MP4 recommended)

### Step 2: Extract Frames
```powershell
cd python-api
.\.venv\Scripts\Activate.ps1
python extract_frames.py
```
**What happens:** The script takes every 10th frame from your video and saves it as an image.

**Output:** Images saved in `frames/` folder (e.g., frame_0.jpg, frame_1.jpg, etc.)

### Step 3: Detect Poses
```powershell
python pose_on_frames.py
```
**What happens:** 
- The AI model (YOLO) analyzes each frame
- It finds people and marks their body parts (17 keypoints per person)
- Saves all the pose data to a JSON file

**Output:** `pose_data/poses.json` with all detected poses

### Step 4: Calculate Speed
```powershell
python compute_speed.py
```
**What happens:**
- Reads the pose data
- Tracks how ankle positions change between frames
- Calculates distance traveled
- Computes average speed

**Output:** Console shows: `Estimated Average Speed: X.XX m/s`

---

## 📊 Understanding the Results

### Frame Extraction Results
- **Location:** `frames/` folder
- **What you see:** Individual images from your video
- **Example:** If your video is 10 seconds at 30fps, you'll get about 30 frames (every 10th frame)

### Pose Detection Results
- **Location:** `pose_data/poses.json`
- **What it contains:** 
  - Frame number
  - Keypoints for each person detected (17 points: nose, eyes, shoulders, elbows, wrists, hips, knees, ankles)
  - X and Y coordinates for each keypoint

### Speed Calculation Results
- **What it shows:** Average movement speed in meters per second
- **How it works:** 
  - Measures distance between ankle positions in consecutive frames
  - Divides by time to get speed
  - Note: Speed accuracy depends on video quality and camera calibration

---

## 🔧 Troubleshooting Common Issues

### Problem: "Cannot find module"
**Solution:** Make sure you've run `npm install` or `pip install` in the correct folder

### Problem: "Port already in use"
**Solution:** Another program is using that port. Close other applications or change the port number

### Problem: "MongoDB connection failed"
**Solution:** 
- Check your `.env` file has the correct MongoDB URI
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify your username and password are correct

### Problem: "Redis connection failed"
**Solution:** 
- Make sure Redis is running (check with Docker or local installation)
- Verify Redis is on port 6379

### Problem: "Virtual environment not found"
**Solution:** 
```powershell
cd python-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 🎓 Key Concepts Explained

### What is an API?
**Simple Explanation:** An API (Application Programming Interface) is like a menu in a restaurant. It lists what you can order (what data you can request) and how to order it (the format of your request).

**In this project:** The backend provides APIs so the frontend can ask for athlete data.

### What is a Database?
**Simple Explanation:** A database is like a digital filing cabinet. Instead of paper files, it stores digital information in an organized way.

**In this project:** MongoDB stores all athlete information.

### What is Background Processing?
**Simple Explanation:** Background processing means doing heavy work (like video analysis) without making the user wait. It's like cooking a meal while the customer waits at their table instead of blocking the kitchen.

**In this project:** Celery processes videos in the background so the website stays responsive.

### What is AI/ML?
**Simple Explanation:** AI (Artificial Intelligence) is like teaching a computer to recognize patterns. In this project, we use YOLO (You Only Look Once) which is trained to recognize people and their body parts in images.

**In this project:** YOLO detects people and tracks 17 key body points (like joints) in each frame.

---

## 📈 What This Project Can Do

### Current Features:
✅ Display athlete information  
✅ Search and browse athletes  
✅ Extract frames from videos  
✅ Detect human poses in images  
✅ Calculate movement speed  
✅ Process videos in the background  
✅ Secure user authentication  

### Future Possibilities:
- Real-time video analysis
- Multiple athlete tracking
- Advanced movement analysis
- Performance comparison
- Injury risk assessment
- Training recommendations

---

## 🎯 Summary

**Khel-Khoj AI** is a complete sports analysis system with three main parts:

1. **Frontend (Next.js)** - The user interface
2. **Backend (Express + MongoDB)** - Data management
3. **AI Service (FastAPI + YOLO)** - Video analysis

The system can analyze sports videos, detect player movements, and calculate performance metrics like speed. All components work together to provide a seamless experience for users who want to analyze athletic performance.

---

## 📞 Need Help?

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify all services are running (check the ports)
3. Review the error messages carefully
4. Check the logs in each service window
5. Ensure Redis and MongoDB are accessible

---

**Last Updated:** December 2024  
**Project Status:** Fully Functional ✅

