# 🌱 CarbonIQ 

A personal carbon footprint tracker that helps you monitor, analyze, and reduce your environmental impact through data-driven insights and actionable suggestions.

![Dashboard Preview](https://img.shields.io/badge/Dashboard-Interactive-green)  
![Carbon Tracking](https://img.shields.io/badge/CO₂-Tracking-blue)  
![Sustainability](https://img.shields.io/badge/Sustainability-Focused-brightgreen)

---

## ✨ Features

- **Real-Time Dashboard** – Interactive visualizations of daily CO₂ emissions  
- **Activity Logging** – Track transport, energy, food, and lifestyle activities  
- **Personalized Suggestions** – Get actionable ways to lower emissions  
- **Emission Trend Analysis** – View charts, categories, and weekly summaries  
- **Sustainability Grading** – See how sustainable your lifestyle is  
- **Export Reports** – Generate PDF & CSV reports  
- **Weather Integration** – Uses OpenWeather API to improve accuracy  
- **User Authentication** – Secure login & registration with hashed passwords  
- **Responsive Frontend** – Optimized for desktop & mobile  

---

## 🚀 Quick Start

### **1. Clone the repository**
```bash
git clone https://github.com/yourusername/carbon-iq.git
cd carbon-iq
```

### **2. Install backend dependencies**
```bash
npm install
```

### **3. Configure environment variables**

Create a `.env` file in the project root:

```
DATABASE_CREDENTIALS=...
API_KEY=...
SESSION_SECRET=...
```

### **4. Start the backend server**
```bash
npm start
```

### **5. Launch the frontend**

#### **Option 1: Open directly**
```
index.html
```

#### **Option 2: Run a local server (recommended)**
```bash
npx live-server
```

---

## 🧱 System Architecture

CarbonIQ uses a **3-tier architecture**:

### **1. Presentation Layer**
- HTML, CSS, JavaScript  
- Bootstrap & Chart.js  
- Fetch/AJAX for API requests  
- Pages: Dashboard, Activity Logs, Suggestions, Reports, Auth  

### **2. Application Layer (Backend)**
- Node.js & Express  
- REST API  
- Middleware: Validation, Error Handling, Sessions  
- Custom Carbon Calculator  
- Weather API integration  
- PDF/CSV generation  

### **3. Data Storage Layer**
- MySQL Database  
- Tables: Users, Activities, Categories, Suggestions, Reports  
- 1:N relationships  

---

## 🔧 Technologies Used

### **Backend**
- Node.js  
- Express.js  
- MySQL  
- Bcrypt  
- OpenWeather API  

### **Frontend**
- HTML  
- CSS  
- JavaScript  
- Bootstrap  
- Chart.js  
- Fetch API / AJAX  



---


CarbonIQ is a comprehensive, user-friendly solution for tracking and reducing personal carbon emissions. Through full-stack development, database design, and API integration, this system provides meaningful insights that encourage sustainable behavior. It demonstrates how software engineering and data management can work together to address real-world environmental challenges.
