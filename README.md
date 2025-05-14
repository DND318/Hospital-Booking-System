# 🏥 Hospital Booking System

A full-stack web application that allows patients to search for doctors and book appointments online, while doctors can manage their profiles and schedules.

This project was built as part of our Software Engineering course using the MERN stack (MongoDB, Express.js, Node.js) with EJS as the templating engine.

---

## 📌 Features

- User authentication for Patients and Doctors
- Role-based dashboards
- Doctor application workflow
- Search and book appointments in real time
- Appointment management for doctors
- Form validation and error messages
- Responsive UI using Bootstrap

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** EJS templating, HTML, CSS, Bootstrap
- **Authentication:** express-session, bcrypt
- **Documentation:** JSDoc
- **Version Control:** Git & GitHub

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DND318/Hospital-Booking-System.git
cd Hospital-Booking-System
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hospital_booking
SESSION_SECRET=your_secret_key
```

4. Start the application:

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 👥 User Roles

### Patient

- Register and login
- View available doctors
- Book and cancel appointments
- View appointment history

### Doctor

- Apply to join the platform
- Login and manage profile
- View upcoming appointments

---

## 📂 Project Structure

```
Hospital-Booking-System/
├── controllers/        # Request handlers
├── models/             # Mongoose schemas
├── routes/             # Application routes
├── views/              # EJS templates
├── public/             # Static assets (CSS, JS, images)
├── app.js              # Main server file
├── package.json
└── .env.example
```

---

## 🧪 Testing

Manual test cases were created to validate:

- Login/Logout functionality
- Registration process
- Appointment booking and cancellation
- Doctor application workflow
- Form validation and error handling

---

## 📸 Screenshots

_You can add screenshots of the patient/doctor dashboards, booking pages, or search functions here to showcase the app UI._

---

## 📈 Future Improvements

- Email notifications for bookings
- Doctor approval system by admin
- Multilingual support
- Telemedicine (video call) integration
- REST API refactor and React frontend (MERN)

---

## 👨‍💻 Authors

- Built by a team of 3 students from IU (2024)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
