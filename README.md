**Eloquent AI — Agent Deployment Manager Take-Home
**
**Prepared by: Defne Erdinc**

**Project Overview
**
This repository contains the implementation for Part B of the Eloquent AI Agent Deployment Manager Take-Home Case Study.

The full assignment consists of two deliverables:

**Part A — ITM Transaction Automation:** A separate PDF report covering discovery questions, operator design, validation, deployment strategy, assumptions, and design decisions.

**Part B — Reference Interface Implementation: **A web-based ITM Operations Dashboard demonstrating transaction management, dashboard metrics, and editable transaction details.

**Live Application**

**Hosted Website:**

https://defneerdinc1995.github.io/eloquent-ai-case-study/

**GitHub Repository:**

https://github.com/defneerdinc1995/eloquent-ai-case-study

**Features**

The application includes:

ITM transaction dashboard with calculated KPIs

Transaction search and filtering

Transaction details and status information

Editable detail views for the first five transaction rows

KPI recalculation following saved changes

Data consistency between detail and dashboard views

Browser-based data persistence using localStorage

Responsive interface for desktop and mobile devices

**Tech Stack**

HTML5

CSS3

JavaScript (ES Modules)

Browser localStorage

GitHub Pages for hosting

The application uses synthetic transaction data and does not connect to a real banking system.

**Running the Project Locally**

**Step 1 — ** Clone the repository

git clone https://github.com/defneerdinc1995/eloquent-ai-case-study.git

**Step 2 —** Navigate to the project directory

cd eloquent-ai-case-study

**Step 3 — **Start a local development server

python3 -m http.server 8000

**Step 4 — **Open the application

Visit http://localhost:8000 in your browser.

No additional packages or environment variables are required.

**Project Structure**

index.html — Main application entry point

styles.css — Application styling and responsive layout

app.mjs — UI rendering, navigation, and user interactions

data.mjs — Synthetic transaction data, KPI calculations, and validation

README.md — Project documentation

**Implementation Notes**

The application demonstrates transaction data management through a browser-based interface.

Transaction edits are stored locally in the user's browser. Saved changes update the displayed transaction information and relevant dashboard metrics.

The application does not perform actual financial transactions or communicate with banking APIs.

**Reference Implementation Limitations**

The original reference interface was unavailable during implementation.

As a result, this application is a functional alternative implementation rather than a verified pixel-perfect reproduction. Its visual design, interactions, and KPI calculations have not been confirmed to match the original reference exactly.

**AI Tools Disclosure**

AI-assisted tools were used to support solution development, frontend implementation, and documentation.

The application and documentation should be reviewed and validated against the original assignment requirements before final submission.

**Author:** Defne Erdinc

**Project: **Eloquent AI — Agent Deployment Manager Take-Home Case Study
