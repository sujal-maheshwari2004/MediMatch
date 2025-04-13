document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in (has token in cookies)
  const checkAuth = () => {
    // In a real application, you would check for a valid token
    // For now, we'll just check if there's any token cookie
    const cookies = document.cookie.split(";");
    const hasToken = cookies.some((cookie) =>
      cookie.trim().startsWith("token=")
    );

    if (!hasToken) {
      // Redirect to login page if no token is found
      window.location.href = "../index.html";
      return false;
    }
    return true;
  };

  // Initialize dashboard if user is authenticated
  if (checkAuth()) {
    initializeDashboard();
    setupEventListeners();
  }

  // Initialize dashboard data
  function initializeDashboard() {
    fetchDoctorData();
    fetchPatients();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Logout button click handler
    document
      .getElementById("logoutBtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });

    // Upload reports button click handler
    document
      .getElementById("uploadReportsBtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        prepareUploadModal();
      });

    // Submit upload form
    document
      .getElementById("submitUploadBtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        uploadReport();
      });
  }

  // Fetch doctor data from backend
  async function fetchDoctorData() {
    try {
      // In a real application, replace with actual API endpoint
      const response = await fetch("http://localhost:3000/api/v1/doctor", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const data = await response.json();
      updateDoctorInfo(data.doctor);
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  }

  // Update doctor information on the dashboard
  function updateDoctorInfo(doctorData) {
    document.getElementById("username").textContent =
      doctorData.name || "Doctor";
    document.getElementById("welcomeUsername").textContent =
      doctorData.name || "Doctor";
  }

  // Fetch patients assigned to the doctor
  async function fetchPatients() {
    try {
      // In a real application, replace with actual API endpoint
      const response = await fetch(
        "http://localhost:3000/api/v1/doctor/users",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      updatePatientsTable(data.users);
    } catch (error) {
      console.error("Error fetching patients:", error);
      // Show no patients message
      document.getElementById("noPatients").classList.remove("d-none");
    }
  }

  // Update patients table with data
  function updatePatientsTable(patients) {
    console.log("Patients data:", patients);
    const tableBody = document.getElementById("patientsTableBody");
    const noPatients = document.getElementById("noPatients");

    // Clear existing rows
    tableBody.innerHTML = "";

    if (!patients || patients.length === 0) {
      noPatients.classList.remove("d-none");
      return;
    }

    // Hide no patients message
    noPatients.classList.add("d-none");

    // Add patient rows to table
    patients.forEach((patient, index) => {
      const row = document.createElement("tr");

      // Determine severity class based on score
      let severityClass = "";
      if (patient.severityScore > 70) {
        severityClass = "severity-high";
      } else if (patient.severityScore > 40) {
        severityClass = "severity-medium";
      } else {
        severityClass = "severity-low";
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${patient.name}</td>
        <td>${patient.currentRank}</td>
        <td class="${severityClass}">${patient.severityScore}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-primary view-details-btn" data-patient-email="${
            patient.email
          }">
            View Details
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners to the view details buttons
    document.querySelectorAll(".view-details-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const patientEmail = this.getAttribute("data-patient-email");
        showPatientDetails(patientEmail);
      });
    });
  }

  // Prepare upload modal with patient data
  function prepareUploadModal() {
    // Fetch patients for dropdown
    fetch("http://localhost:3000/api/v1/doctor/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch patients");
        return response.json();
      })
      .then((data) => {
        const patientSelect = document.getElementById("patientSelect");

        // Clear previous options
        patientSelect.innerHTML =
          '<option value="" selected disabled>Choose a patient</option>';

        // Add patient options
        data.users.forEach((patient) => {
          const option = document.createElement("option");
          option.value = patient.email;
          option.textContent = `${patient.name} (${patient.email})`;
          patientSelect.appendChild(option);
        });

        // Show the modal
        const uploadModal = new bootstrap.Modal(
          document.getElementById("uploadReportsModal")
        );
        uploadModal.show();
      })
      .catch((error) => {
        console.error("Error preparing upload modal:", error);
        alert("Failed to load patient list. Please try again.");
      });
  }

  // Upload report for selected patient
  async function uploadReport() {
    const patientEmail = document.getElementById("patientSelect").value;
    const reportFile = document.getElementById("reportFile").files[0];

    if (!patientEmail || !reportFile) {
      alert("Please select both a patient and a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("userEmail", patientEmail);
    formData.append("file", reportFile);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/doctor/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Close the modal
      const uploadModal = bootstrap.Modal.getInstance(
        document.getElementById("uploadReportsModal")
      );
      uploadModal.hide();

      // Show success message
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Failed to upload report. Please try again.");
    }
  }

  // Show patient details in modal
  async function showPatientDetails(patientEmail) {
    try {
      // Fetch patient details
      const response = await fetch(
        `http://localhost:3000/api/v1/doctor/user?email=${patientEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const data = await response.json();
      const patient = data.user;

      // Update modal with patient data
      document.getElementById("modalPatientName").textContent = patient.name;
      document.getElementById("modalPatientEmail").textContent = patient.email;
      document.getElementById("modalPatientPhone").textContent = patient.phone;
      document.getElementById("modalOrganRequired").textContent =
        patient.organRequired || "None";
      document.getElementById("modalBloodGroup").textContent =
        patient.medicalDetails?.bloodGroup || "Unknown";
      document.getElementById("modalBloodPressure").textContent =
        patient.medicalDetails?.bloodPressure || "Unknown";
      document.getElementById("modalHeartAttack").textContent =
        patient.medicalDetails?.heartAttack === true
          ? "Yes"
          : "No" || "Unknown";
      document.getElementById("modalHeartValve").textContent =
        patient.medicalDetails?.heartValve === true ? "Yes" : "No" || "Unknown";
      document.getElementById("modalHeartDefectByBirth").textContent =
        patient.medicalDetails?.heartDefectByBirth === true
          ? "Yes"
          : "No" || "Unknown";
      document.getElementById("modalCardiomyopathy").textContent =
        patient.medicalDetails?.cardiomyopathy === true
          ? "Yes"
          : "No" || "Unknown";

      // Update reports table
      const reportsTableBody = document.getElementById("modalReportsTableBody");
      const noReports = document.getElementById("modalNoReports");

      // Clear existing reports
      reportsTableBody.innerHTML = "";

      if (!patient.medicalreports || patient.medicalreports.length === 0) {
        noReports.classList.remove("d-none");
      } else {
        noReports.classList.add("d-none");

        // Add reports to table
        patient.medicalreports.forEach((report) => {
          // Extract filename from path
          const fileName = report.split("/").pop();

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${fileName.split("-")[1]}</td>
            <td>
              <button class="btn btn-sm btn-primary view-report-btn" data-report="${report}">
                View
              </button>
            </td>
          `;
          reportsTableBody.appendChild(row);
        });

        // Add event listeners to view report buttons
        document.querySelectorAll(".view-report-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const reportPath = this.getAttribute("data-report");
            window.open(reportPath, "_blank");
          });
        });
      }

      // Show the modal
      const detailsModal = new bootstrap.Modal(
        document.getElementById("patientDetailsModal")
      );
      detailsModal.show();
    } catch (error) {
      console.error("Error showing patient details:", error);
      alert("Failed to load patient details. Please try again.");
    }
  }

  // Logout function
  async function logout() {
    try {
      // In a real application, call logout API endpoint
      const response = await fetch("http://localhost:3000/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      // Even if the logout API fails, clear cookies and redirect
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to login page
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error during logout:", error);
      // If API call fails, still logout locally
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to login page
      window.location.href = "../index.html";
    }
  }
});
