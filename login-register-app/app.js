require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Configure Sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Use true for HTTPS
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Doctor'], required: true },
});

const User = mongoose.model('User', userSchema);

// Patient Schema
const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Patient = mongoose.model('Patient', patientSchema);

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: false },
  experience: { type: Number, required: false },
  fee: { type: Number, required: false },
  startTime: { type: String, required: false },
  endTime: { type: String, required: false },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Routes
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { username, password, role, fullName, phone, email } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists. Please choose another.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new User
    const newUser = new User({ username, password: hashedPassword, role });
    const savedUser = await newUser.save();

    // Create Patient or Doctor record based on the role
    if (role === 'Patient') {
      const newPatient = new Patient({
        fullName,
        phone,
        email, // Save the email
        userID: savedUser._id,
      });
      await newPatient.save();
    } else if (role === 'Doctor') {
      const newDoctor = new Doctor({
        fullName,
        phone,
        email, // Save the email
        userID: savedUser._id,
      });
      await newDoctor.save();
    }

    // Redirect to login after successful
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error during registration:', error);

    // Handle duplicate key errors ví dụ: duplicate usernames
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists. Please choose another.' });
    }

    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Login Route with Sessions
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Store user details in session
    req.session.user = {
      id: user._id,
      role: user.role,
      username: user.username,
    };

    // Redirect based on role
    if (user.role === 'Patient') {
      res.status(200).json({ message: 'Login successful!', redirect: '/patient' });
    } else if (user.role === 'Doctor') {
      res.status(200).json({ message: 'Login successful!', redirect: '/doctor' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login. Please try again.' });
  }
});


// ApplyDoctor Route
app.post('/applyDoctor', async (req, res) => {
  try {
    const { specialization, experience, fee, startTime, endTime } = req.body;

    // Find the logged-in doctor's basic record
    const doctor = await Doctor.findOne({ userID: req.session.user.id });

    if (!doctor) {
      return res.status(404).json({ status: 'error', message: 'Doctor record not found' });
    }

    // Update doctor-specific information
    doctor.specialization = specialization;
    doctor.experience = experience;
    doctor.fee = fee;
    doctor.startTime = startTime;
    doctor.endTime = endTime;

    await doctor.save();
    res.status(200).json({ status: 'success', message: 'Doctor information updated successfully!' });
  } catch (error) {
    console.error('Error saving doctor information:', error);
    res.status(500).json({ status: 'error', message: 'Error submitting form. Please try again.' });
  }
});

// Middleware to Ensure Authentication
const isAuthenticated = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      next();
    } else {
      res.status(403).send('Access denied');
    }
  };
};

// Patient Homepage Route
app.get('/patient', isAuthenticated('Patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userID: req.session.user.id }).populate('userID');
    res.render('patient-dashboard', {
      patient,
      username: req.session.user.username,
    });
  } catch (error) {
    console.error('Error loading patient homepage:', error);
    res.status(500).send('Server error');
  }
});

// Doctor Homepage Route
app.get('/doctor', isAuthenticated('Doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userID: req.session.user.id }).populate('userID');
    res.render('doctor-dashboard', {
      doctor,
      username: req.session.user.username,
    });
  } catch (error) {
    console.error('Error loading doctor homepage:', error);
    res.status(500).send('Server error');
  }
});

// ApplyDoctor Route
app.get('/ApplyDoctor', isAuthenticated('Doctor'), (req, res) => {
  res.render('ApplyDoctor');
});

// Booking Appointment
app.post('/book', async (req, res) => {
  try {
    const { doctorId, dateTime } = req.body;

    // Find the doctor to check their available timings
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Parse the doctor's available start and end times
    const startTime = new Date(`1970-01-01T${doctor.startTime}:00`);
    const endTime = new Date(`1970-01-01T${doctor.endTime}:00`);

    // Parse the booking date and time
    const bookingTime = new Date(dateTime);
    const bookingTimeOnly = new Date(`1970-01-01T${bookingTime.toTimeString().slice(0, 5)}:00`);

    // Check if the booking time falls within the doctor's available times
    if (bookingTimeOnly < startTime || bookingTimeOnly > endTime) {
      return res.status(400).json({
        message: `Booking time must be between ${doctor.startTime} and ${doctor.endTime}.`,
      });
    }

    // Find the patient's record using their session user ID
    const patient = await Patient.findOne({ userID: req.session.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Create the appointment if the time is valid
    const newAppointment = new Appointment({
      doctorID: doctorId,
      patientID: patient._id,
      dateTime: bookingTime,
      status: 'Pending',
    });

    await newAppointment.save();

    // Respond with a success message
    res.status(200).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Approve Appointment
app.post('/appointments/approve', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Update the appointment status to "Approved"
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'Approved' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json({ message: 'Appointment approved successfully!' });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Decline Appointment
app.post('/appointments/decline', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Update the appointment status to "Declined"
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'Declined' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json({ message: 'Appointment declined successfully!' });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Update Appointment Status
app.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json({ message: `Appointment ${status.toLowerCase()} successfully!` });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});



// Redirect the root URL to either login or the appropriate dashboard
app.get('/', (req, res) => {
  if (req.session.user) {
    // Redirect based on role
    if (req.session.user.role === 'Patient') {
      res.redirect('/patient');
    } else if (req.session.user.role === 'Doctor') {
      res.redirect('/doctor');
    }
  } else {
    // Redirect to login if no user is authenticated
    res.redirect('/login');
  }
});

// Other routes
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Doctor Appointments Route
app.get('/doctor/appointments', isAuthenticated('Doctor'), async (req, res) => {
  try {
    // Find the logged-in doctor's record
    const doctor = await Doctor.findOne({ userID: req.session.user.id });

    if (!doctor) {
      return res.status(404).send('Doctor record not found.');
    }

    // Retrieve appointments for the doctor and populate patient details
    const appointments = await Appointment.find({ doctorID: doctor._id })
      .populate('patientID', 'fullName phone email'); // Populate only the required fields

    // Render the appointments page with the data
    res.render('doctor-appointments', {
      doctor,
      appointments,
      username: req.session.user.username,
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).send('Server error');
  }
});



// Search Book Route
app.get('/search-book', isAuthenticated('Patient'), async (req, res) => {
  try {
    const { search } = req.query;
    let doctors;

    if (search) {
      // Search by name or specialization
      doctors = await Doctor.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } },
        ],
      });
    } else {
      // Fetch all doctors if no search term is provided
      doctors = await Doctor.find();
    }

    res.render('search-and-book', { doctors, search });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Error fetching doctors.');
  }
});


// Patient Appointment Route
app.get('/patient/appointments', isAuthenticated('Patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userID: req.session.user.id });

    if (!patient) {
      return res.status(404).send('Patient record not found.');
    }

    const appointments = await Appointment.find({ patientID: patient._id })
      .populate('doctorID') // Populate doctor details
      .sort({ dateTime: 1 }); // Sort by appointment date

    res.render('patient-appointments', { patient, appointments });
  } catch (error) {
    console.error('Error fetching appointments for patient:', error);
    res.status(500).send('Server error.');
  }
});


// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Logout error');
    }
    res.redirect('/login');
  });
});

// Start Server
app.listen(3000, () => console.log(`Server running on port 3000`));
