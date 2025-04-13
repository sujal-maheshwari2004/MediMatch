# MediMatch

MediMatch is a comprehensive organ donation management system that connects patients in need of organ transplants with suitable donors and medical professionals.

## Features

### For Patients

- View their medical status, current ranking, and severity score
- Access medical reports
- View assigned doctor details

### For Doctors

- View list of assigned patients
- Upload medical reports for patients
- Access patient medical details

### For Administrators

- Verify new patient and doctor registrations
- Monitor the system operations

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **ML Component**: Patient severity scoring algorithms

## Project Structure

- `/frontend` - Contains all frontend code
  - `/css` - Stylesheets
  - `/js` - JavaScript files
  - `/pages` - HTML pages
- `/backend` - Contains all backend code
  - `/src` - TypeScript source files
    - `/controllers` - Request handlers
    - `/models` - Database models
    - `/routes` - API routes
    - `/middlewares` - Express middlewares
    - `/utils` - Utility functions
  - `/agent` - ML components for patient scoring

## Getting Started

1. Clone this repository
2. Install dependencies for both frontend and backend
3. Set up MongoDB database
4. Configure environment variables
5. Start the backend server
6. Open the frontend in a web browser
