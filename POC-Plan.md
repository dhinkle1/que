# Education Game App POC Plan

## Overview

This document outlines the proof-of-concept (POC) plan for an educational quiz game application targeting desktop, tablet, and mobile platforms. It includes high-level architecture, feature flows, data storage considerations, and next steps.

---

## 1. Tech Stack

- **Front-end (Web):** React (TypeScript) scaffolded via Vite
- **Front-end (Mobile):** React Native (TypeScript)
- **Styles:** Tailwind CSS (web) / React Native styling
- **Back-end:** Python FastAPI (async REST API)
- **Task Queue:** Celery (Redis broker & backend)
- **Cache:** Redis
- **Database:** PostgreSQL
- **Question Model:** Dummy generator function (swap in ML service later)

---

## 2. Ports & CORS

- **Front-end Dev Server:**
  - Port: **51889**
  - Host: `0.0.0.0`
  - CORS: enabled
  - Iframe: allowed

- **Back-end Server:**
  - Port: **55939**
  - CORS: open (allow requests from front-end)

---

## 3. Infrastructure & Scalability

- **Cloud Platform:** AWS (Fargate or Auto Scaling Groups)
- **API Gateway:** AWS API Gateway (rate limiting + authentication)
- **Load Balancer:** AWS ELB/ALB
- **CDN:** AWS CloudFront for static assets
- **Containerization:** Docker images stored in AWS ECR
- **CI/CD:** GitHub Actions or AWS CodePipeline for automated build & deploy

---

## 3. Front-end Pages & Flows

### 3.1 Book Search
- Query Google Books API
- Display results
- User selects one book

### 3.2 Quiz Setup
- **Difficulty:** dropdown with three levels:
  1. **Of Simple Inclination** (Easy)
  2. **Of Earnest Pursuit** (Medium)
  3. **Of Considerable Travail** (Hard)
- **Number of Questions:** dropdown [10, 20, 30]
- **Start Quiz** button

### 3.3 Quiz Screen
- Display one question at a time
- Four answer options (only one correct)
- Immediate feedback: ✓ or ✗
- Running score

### 3.4 Results Screen
- Final score as percentage (e.g., 80%)
- Leader grade based on score
- List of incorrectly answered questions with:
  - Correct answer
  - Explanation of why it’s correct
- **Replay Options:**
  - "Retake same quiz"
  - "Try another quiz from same book"

### 3.5 History Screen
- Show past quizzes:
  - Book metadata
  - Date taken
  - Score
- Drill into details per quiz

---

## 4. Back-end API Endpoints

- **POST /api/quiz**  
  Generate quiz questions (dummy logic)
- **POST /api/history**  
  Save completed quiz result
- **GET  /api/history**  
  Retrieve past quizzes

---

## 5. Data Storage

- **Quiz History:**
  - Book metadata (see Section 6)
  - Number of questions and difficulty
  - Score
  - Incorrect questions + correct answers + explanations
- **Book Metadata Storage:**
  - Title
  - Author(s)
  - Google Books ID
  - Description or subjects (optional)

---

## 6. Quiz Replay & Retake

- Allow user to "Retake same quiz"
- Allow user to "Try another quiz from same book"

---

## 7. Error Handling Plan

- Provide user feedback for failed API calls or generation errors:
  - Display error messages (e.g., "Unable to load questions. Please try again.")
  - Fallback behaviors (e.g., retry button)

---

## 8. Next Steps

1. Integrate real question-generation model (e.g., OpenAI GPT)
2. Migrate to a persistent database (SQLite, MongoDB, or PostgreSQL)
3. Enhance UI/UX with design polish and animations
4. Add user authentication & personalization
5. Implement automated tests

---

*End of POC Plan*
