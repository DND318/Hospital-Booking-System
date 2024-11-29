require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
  });

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Defind Doctor Schema
const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  fee: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// Routes
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/applyDoctor', (req, res) => {res.render('ApplyDoctor');});

// Appointments Route to retrieve doctors from MongoDB and render them
app.get('/appointments', async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Get all doctor data from MongoDB
    res.render('appointments', { doctors }); // Pass doctors array to the view
  } catch (error) {
    console.error('Error fetching doctor list:', error);
    res.status(500).send('Server error');
  }
});

// Doctor Details Route
app.get('/doctor-details/:id', async (req, res) => {
  try {
      const doctor = await Doctor.findById(req.params.id);
      if (doctor) {
          res.render('doctor-details', { doctor });
      } else {
          res.status(404).send('Doctor not found');
      }
  } catch (error) {
      console.error('Error fetching doctor details:', error);
      res.status(500).send('Server error');
  }
});

// Register Route
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(400).send('Error: Username already exists');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      res.redirect('/homepage.html'); // Redirect to homepage.html
    } else {
      res.status(400).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).send('Server error');
  }
});

// Doctor Route
app.post('/applyDoctor', async (req, res) => {
  try {
    // Debugging: Log incoming request body
    console.log("Request Body:", req.body);

    // Ensure all required fields are properly extracted
    const newDoctor = new Doctor({
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,  // Note: Corrected from "Email" to "email" to match the form
      address: req.body.address,
      specialization: req.body.specialization,
      experience: req.body.experience,
      fee: req.body.fee,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });

    // Attempt to save the doctor
    await newDoctor.save();
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error saving doctor application:', error);
    res.status(500).json({ message: 'Error submitting form. Please try again.' });
  }
});

// Route for booking page
app.post('/book', (req, res) => {
  //console.log(req.body); // Debug: Log request body to verify incoming data

  const { doctorName, doctorPhone, doctorAddress, doctorFee, date, email, time } = req.body;

  res.render('booking-receipt', {
      doctor: {
          name: doctorName,
          phone: doctorPhone,
          address: doctorAddress,
          fee: doctorFee,
      },
      booking: {
          date: date,
          email: email,
          time: time,
      }
  });
});


// Start Server on default port 3000
app.listen(3000, () => console.log(`Server running on port 3000`));
