# Aura E-Commerce Project

A complete E-Commerce web application featuring a vanilla HTML/CSS/JS frontend and a Node.js (Express) backend. It includes user authentication, product management, order processing, and payment gateway integration using Razorpay. 

There are also auxiliary Python scripts included for automated document processing and generating internship/training reports.

---

## 🏗️ Project Architecture

### 1. Frontend
- **Tech Stack:** HTML5, CSS3, JavaScript (Vanilla)
- **Files:**
  - `index.html`: The main user interface.
  - `style.css`: Stylesheet for the UI.
  - `script.js`: Handles frontend logic, API requests, and dynamic DOM manipulation.

### 2. Backend Server
- **Tech Stack:** Node.js, Express.js, MongoDB (Mongoose)
- **Directory:** `/backend`
- **Key Dependencies:** 
  - `express`: Web framework for REST API.
  - `mongoose`: MongoDB object modeling.
  - `jsonwebtoken` / `bcryptjs`: User authentication & security.
  - `razorpay`: Payment gateway integration.
  - `cors` / `dotenv`: Middleware and environment config.

**API Routes:**
- `/api/auth` - User login and registration.
- `/api/users` - User profile management.
- `/api/products` - Product listing and details.
- `/api/addresses` - User shipping addresses.
- `/api/orders` - Order placement and history.
- `/api/payment` - Razorpay transaction initialization and verification.

### 3. Python Automation Scripts
- **Tech Stack:** Python, `python-docx`
- **Files:**
  - `fill_report.py`: Programmatically fills data into a Word Document (`.docx`) template (e.g., Student Info, Internship details).
  - `inspect_template.py`: Utility to inspect the structure of `.docx` templates.
  - `template_structure.txt`: Output or reference for the template layout.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [Python 3.x](https://www.python.org/)
- MongoDB URI (if connecting to your own database instead of the provided cluster)
- Razorpay Account Credentials

### Step 1: Configure the Backend Environment
1. Navigate to the `backend` directory.
2. Rename `.env.example` to `.env` (or update the existing `.env` file).
3. Ensure the environment variables are correctly set:
   ```env
   PORT=5000
   MONGO_URI=mongodb://...
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

### Step 2: Start the Backend Server
```bash
cd backend
npm install
node server.js
```
*The API will start running at `http://localhost:5000`.*

> **Optional:** If the database is empty, run `node seed.js` inside the `backend` folder to populate initial mock data (products, etc.).

### Step 3: Run the Frontend
You can serve the frontend directly via any local HTTP server:
```bash
npx serve .
# OR
python -m http.server 8000
```
*Then visit `http://localhost:8000` in your web browser.*

---

## 🛠️ Running the Python Scripts

To use the automated document generation, ensure you have the required packages:

```bash
pip install python-docx
```

Run the report filler script:
```bash
python fill_report.py
```
This script reads the target template and generates a filled `.docx` output according to the parameters specified inside the python file.
