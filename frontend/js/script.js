document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const organSelectionSection = document.getElementById('organSelectionSection');
    const doctorsSection = document.getElementById('doctorsSection');
    const assignedDoctorSection = document.getElementById('assignedDoctorSection');
    const doctorsList = document.getElementById('doctorsList');
    const backToOrgansBtn = document.getElementById('backToOrgans');
    const organBtns = document.querySelectorAll('.organ-btn');
    
    // Sample data for doctors (in a real app, this would come from an API)
    const doctorsByOrgan = {
        heart: [
            { id: 1, name: 'Dr. Jane Smith', specialty: 'Cardiologist', image: 'https://via.placeholder.com/150', experience: '15 years', urgency: 'medium' },
            { id: 2, name: 'Dr. Robert Johnson', specialty: 'Heart Surgeon', image: 'https://via.placeholder.com/150', experience: '12 years', urgency: 'high' },
            { id: 3, name: 'Dr. Emily Clark', specialty: 'Cardiovascular Specialist', image: 'https://via.placeholder.com/150', experience: '10 years', urgency: 'low' }
        ],
        brain: [
            { id: 4, name: 'Dr. Michael Brown', specialty: 'Neurologist', image: 'https://via.placeholder.com/150', experience: '18 years', urgency: 'high' },
            { id: 5, name: 'Dr. Sarah Wilson', specialty: 'Neurosurgeon', image: 'https://via.placeholder.com/150', experience: '14 years', urgency: 'medium' }
        ],
        lungs: [
            { id: 6, name: 'Dr. Thomas Lee', specialty: 'Pulmonologist', image: 'https://via.placeholder.com/150', experience: '9 years', urgency: 'medium' },
            { id: 7, name: 'Dr. Rebecca White', specialty: 'Respiratory Specialist', image: 'https://via.placeholder.com/150', experience: '11 years', urgency: 'low' }
        ],
        kidney: [
            { id: 8, name: 'Dr. David Miller', specialty: 'Nephrologist', image: 'https://via.placeholder.com/150', experience: '13 years', urgency: 'high' },
            { id: 9, name: 'Dr. Amanda Garcia', specialty: 'Urologist', image: 'https://via.placeholder.com/150', experience: '8 years', urgency: 'low' }
        ]
    };
    
    // Event Listeners
    organBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const organ = this.getAttribute('data-organ');
            showDoctors(organ);
        });
    });
    
    backToOrgansBtn.addEventListener('click', function() {
        doctorsSection.style.display = 'none';
        organSelectionSection.style.display = 'block';
    });
    
    // Functions
    function showDoctors(organ) {
        // Clear previous doctor cards
        doctorsList.innerHTML = '';
        
        // Get doctors for the selected organ
        const doctors = doctorsByOrgan[organ] || [];
        
        // Create and append doctor cards
        doctors.forEach(doctor => {
            const doctorCard = createDoctorCard(doctor);
            doctorsList.appendChild(doctorCard);
        });
        
        // Show doctors section and hide organ selection
        organSelectionSection.style.display = 'none';
        doctorsSection.style.display = 'block';
    }
    
    function createDoctorCard(doctor) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-3';
        
        colDiv.innerHTML = `
            <div class="card doctor-card">
                <div class="card-body text-center">
                    <img src="${doctor.image}" class="rounded-circle mb-3" width="100" height="100">
                    <h5 class="card-title">${doctor.name}</h5>
                    <p class="card-text">${doctor.specialty}</p>
                    <p class="card-text"><small class="text-muted">Experience: ${doctor.experience}</small></p>
                    <button class="btn btn-primary select-doctor" data-doctor-id="${doctor.id}">Select Doctor</button>
                </div>
            </div>
        `;
        
        // Add event listener to the select button
        colDiv.querySelector('.select-doctor').addEventListener('click', function() {
            selectDoctor(doctor);
        });
        
        return colDiv;
    }
    
    function selectDoctor(doctor) {
        // Show only the doctor assigned message
        showDoctorAssignedMessage(doctor.name);
        
        // Update assigned doctor information
        document.getElementById('doctorImage').src = doctor.image;
        document.getElementById('doctorName').textContent = doctor.name;
        document.getElementById('doctorSpecialty').textContent = doctor.specialty;
        
        // Hide doctors section and show assigned doctor section
        doctorsSection.style.display = 'none';
        assignedDoctorSection.style.display = 'block';
    }
    
    // Function to show doctor assigned message
    function showDoctorAssignedMessage(doctorName) {
        // Create the notification element
        const notification = document.createElement('div');
        notification.className = 'alert alert-success doctor-assigned-alert';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Success!</strong> ${doctorName} has been assigned to you.
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Position the notification
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.zIndex = '1050';
        notification.style.minWidth = '300px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.3s ease';
        
        // Add to the DOM
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Add event listener to close button
        notification.querySelector('.btn-close').addEventListener('click', function() {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
});