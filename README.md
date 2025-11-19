# 🌱 CarbonIQ 

A personal carbon footprint tracker that helps you monitor, analyze, and reduce your environmental impact through data-driven insights and actionable suggestions.

![Dashboard Preview](https://img.shields.io/badge/Dashboard-Interactive-green) ![Carbon Tracking](https://img.shields.io/badge/CO₂-Tracking-blue) ![Sustainability](https://img.shields.io/badge/Sustainability-Focused-brightgreen)

## ✨ Features

 Real-Time Dashboard – Interactive visualizations of daily CO₂ emissions

 Activity Logging – Track transport, energy, food, and lifestyle activities

 Personalized Suggestions – Get actionable ways to lower emissions

 Emission Trend Analysis – View charts, categories, and weekly summaries

 Sustainability Grading – View how sustainable your lifestyle is

 Export Reports – Generate PDF & CSV reports

 Weather Integration – Uses OpenWeather API to improve emission accuracy

 User Authentication – Secure login & registration with hashed passwords

 Responsive Frontend – Fully optimized for desktop & mobile


## 🚀 Quick Start


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carbon-iq.git
   cd carbon-iq

2️⃣ Install backend dependencies
npm install

3️⃣ Configure environment variables

Create a .env file containing:

DATABASE_CREDENTIALS=...
API_KEY=...
SESSION_SECRET=...

4️⃣ Start the backend server
npm start

5️⃣ Launch the frontend
# Option 1: Open directly
Open index.html

# Option 2: Run local server (recommended)
npx live-server

🧱 System Architecture
CarbonIQ uses a 3-tier architecture:

1. Presentation Layer
   - HTML, CSS, JS
   - Bootstrap & Chart.js
   - Fetch/AJAX for API requests
   - Pages: Dashboard, Activity Logs, Suggestions, Reports, Auth

2. Application Layer (Backend)
   - Node.js & Express
   - REST API
   - Middleware: Validation, Error Handling, Sessions
   - Custom Carbon Calculator
   - Weather API Integration
   - PDF/CSV Generation

3. Data Storage Layer
   - MySQL Database
   - Tables: Users, Activities, Categories, Suggestions, Reports
   - 1:N relationships across entities

🗃 Database Design (ERD Summary)
Entities:
- User
- Activity
- Category
- Suggestion
- Report

Key Relationships:
- User → Activity: 1:N
- Category → Activity: 1:N
- Activity → Suggestion: 1:N
- User → Report: 1:N

🔧 Technologies Used
Backend:
- Node.js
- Express.js
- MySQL
- Bcrypt
- OpenWeather API

Frontend:
- HTML
- CSS
- JavaScript
- Bootstrap
- Chart.js
- Fetch API / AJAX

Tools:
- Postman
- VSCode
- Git & GitHub

⚙️ Key Backend Functionalities
- Secure user registration
- Login & session management
- CRUD operations for activities
- Custom-built CO₂ emission calculator
- Weather data integration
- Error handling & validation
- PDF and CSV report generator
- MySQL connection pool

🎨 Key Frontend Functionalities
- Form validation (login + registration)
- Dashboard navigation system
- Activity creation + logs
- Sorting, filtering, and searching
- Graph visualizations using Chart.js
- Suggestion pages
- Emission reports & export

🧩 Contribution Breakdown
Inshal — Backend Developer
- Built backend architecture
- API endpoints
- Authentication
- Emission calculator
- Database integration
- Export system (PDF/CSV)

Zainab — Frontend Developer
- Built UI/UX
- Dashboard + forms
- Chart.js visualizations
- Fetch API integration
- Responsive design

Armaan — Documentation Lead
- Entire written report
- README + API docs
- ER diagrams
- Presentation slides

🧪 Challenges Faced
- No suitable free carbon calculator → required custom algorithm
- Designing a normalized database schema
- Ensuring seamless frontend-backend communication
- Handling multiple input types reliably
- Dealing with activity variations across categories

🔮 Future Enhancements
- Mobile app version
- User achievements & milestones
- Social leaderboard system
- Community mode for shared reports
- More advanced API for carbon calculations
- AI-based suggestion engine

✅ Conclusion
CarbonIQ is a comprehensive, user-friendly solution for tracking and reducing personal carbon emissions. Through full-stack development, database design, and API integration, this system provides meaningful insights that encourage sustainable behavior. It demonstrates how software engineering and data management can work together to address real-world environmental challenges.





