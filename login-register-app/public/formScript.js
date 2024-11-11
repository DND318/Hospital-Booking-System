// Doctor information array
const doctors = {
    1: {
        name: "Dr. Sadaf Hanif Awan",
        specialty: "General Practitioner",
        location: "New Al Shefa Clinic - Al Wasl Road",
        photo: "doctor1.jpg"
    },
    2: {
        name: "Dr. Alex Johnson",
        specialty: "Cardiologist",
        location: "Heart Care Center - Downtown",
        photo: "doctor2.jpg"
    },
    3: {
        name: "Dr. Maria Lee",
        specialty: "Pediatrician",
        location: "Happy Kids Clinic - Uptown",
        photo: "doctor3.jpg"
    }
};

// Get doctor ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get("doctor");
const doctor = doctors[doctorId];

// Populate the doctor information on the page
if (doctor) {
    document.getElementById("doctorPhoto").src = doctor.photo;
    document.getElementById("doctorName").textContent = doctor.name;
    document.getElementById("doctorSpecialty").textContent = doctor.specialty;
    document.getElementById("doctorLocation").textContent = doctor.location;
    document.getElementById("doctorNameForm").textContent = doctor.name;
} else {
    console.error("Doctor information not found.");
}
