document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const roleSelect = document.getElementById("role");
  const roleSpecificFields = document.getElementById("roleSpecificFields");
  const formErrors = document.getElementById("formErrors");

  // Event listener for role change
  roleSelect.addEventListener("change", updateFormFields);

  // Event listener for form submission
  signupForm.addEventListener("submit", handleSignup);

  // Function to update form fields based on selected role
  function updateFormFields() {
    const selectedRole = roleSelect.value;

    // Clear previous role-specific fields
    roleSpecificFields.innerHTML = "";

    // Add fields specific to the selected role
    if (selectedRole === "user") {
      // Patient-specific fields
      roleSpecificFields.innerHTML = `
        <div class="mb-3">
          <label for="age" class="form-label">Age</label>
          <input type="number" class="form-control" id="age" min="1" max="120" required placeholder="Enter your age" />
        </div>
        
        <div class="mb-4">
          <label for="gender" class="form-label">Gender</label>
          <select class="form-select" id="gender" required>
            <option value="" selected disabled>Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      `;
    } else if (selectedRole === "doctor") {
      // Doctor-specific fields
      roleSpecificFields.innerHTML = `
        <div class="mb-4">
          <label for="department" class="form-label">Department</label>
          <select class="form-select" id="department" required>
            <option value="" selected disabled>Select your department</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Gastroenterology">Gastroenterology</option>
            <option value="Oncology">Oncology</option>
            <option value="General">General</option>
          </select>
        </div>
      `;
    }
    // Admin doesn't need additional fields
  }

  // Function to handle form submission
  async function handleSignup(e) {
    e.preventDefault();

    // Clear previous error messages
    formErrors.textContent = "";
    formErrors.classList.add("d-none");

    // Get common form values
    const role = roleSelect.value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    const errors = [];

    if (!role) {
      errors.push("Please select a role");
    }

    if (!name || name.trim().length < 3) {
      errors.push("Name must be at least 3 characters");
    }

    if (!email || !isValidEmail(email)) {
      errors.push("Please enter a valid email address");
    }

    if (!phone || !isValidPhone(phone)) {
      errors.push("Please enter a valid phone number");
    }

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    // Role-specific validation
    if (role === "user") {
      const age = document.getElementById("age").value;
      const gender = document.getElementById("gender").value;

      if (!age || age < 1 || age > 120) {
        errors.push("Please enter a valid age");
      }

      if (!gender) {
        errors.push("Please select your gender");
      }
    } else if (role === "doctor") {
      const department = document.getElementById("department").value;

      if (!department) {
        errors.push("Please select your department");
      }
    }

    // Display errors if any
    if (errors.length > 0) {
      formErrors.innerHTML = errors.map((err) => `<div>${err}</div>`).join("");
      formErrors.classList.remove("d-none");
      return;
    }

    // Prepare signup data
    const signupData = {
      name,
      email,
      password,
      phone,
      role,
    };

    // Add role-specific data
    if (role === "user") {
      signupData.age = document.getElementById("age").value;
      signupData.gender = document.getElementById("gender").value;
    } else if (role === "doctor") {
      signupData.department = document.getElementById("department").value;
    }

    try {
      // Send signup request to backend
      const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to success page
      window.location.href = `success.html?role=${role}&action=signup`;
    } catch (error) {
      console.error("Error during signup:", error);
      formErrors.textContent =
        error.message || "Signup failed. Please try again.";
      formErrors.classList.remove("d-none");
    }
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper function to validate phone number
  function isValidPhone(phone) {
    // Simple validation: at least 10 digits
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }
});
