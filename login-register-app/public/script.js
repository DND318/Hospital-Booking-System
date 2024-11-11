// Array of doctor information
const doctors = {
    1: {
        name: "Dr. Sadaf Hanif Awan",
        specialty: "General Practitioner",
        location: "New Al Shefa Clinic - Al Wasl Road",
        photo: "/doctor1.png"
    },
    2: {
        name: "Dr. Alex Johnson",
        specialty: "Cardiologist",
        location: "Heart Care Center - Downtown",
        photo: "/doctor2.png"
    },
    3: {
        name: "Dr. Maria Lee",
        specialty: "Pediatrician",
        location: "Happy Kids Clinic - Uptown",
        photo: "/doctor3.png"
    }
};

// Handle doctor thumbnail click
document.querySelectorAll(".doctor-thumbnail").forEach(thumbnail => {
    thumbnail.addEventListener("click", function() {
        const doctorId = this.getAttribute("data-doctor");
        window.location.href = `doctor_form.html?doctor=${doctorId}`; // Redirect with doctor ID
    });
});
