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
    fetchUserData();
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
  }

  // Check verification status and show/hide verification banner
  function checkVerificationStatus(userData) {
    if (!userData.isVerified) {
      // Show verification banner and overlay
      document.getElementById("verificationOverlay").style.display = "block";
      document.getElementById("verificationBanner").style.display = "block";
      document
        .getElementById("dashboardContent")
        .classList.add("dashboard-blurred");
    } else {
      // Hide verification banner and overlay if user is verified
      document.getElementById("verificationOverlay").style.display = "none";
      document.getElementById("verificationBanner").style.display = "none";
      document
        .getElementById("dashboardContent")
        .classList.remove("dashboard-blurred");
    }
  }

  // Fetch user data from backend
  async function fetchUserData() {
    try {
      // In a real application, replace with actual API endpoint
      const response = await fetch("http://localhost:3000/api/v1/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      // Check verification status
      checkVerificationStatus(data.user);

      // Update dashboard only if verified
      if (data.user.isVerified) {
        updateDashboard(data.user);
      } else {
        // Still update basic user info even if not verified
        document.getElementById("username").textContent =
          data.user.name || "User";
        document.getElementById("welcomeUsername").textContent =
          data.user.name || "User";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Update dashboard with user data
  function updateDashboard(userData) {
    console.log("User Data:", userData);

    // Update user name
    document.getElementById("username").textContent = userData.name || "User";
    document.getElementById("welcomeUsername").textContent =
      userData.name || "User";

    // Update status information
    document.getElementById("currentStanding").textContent =
      userData.currentRank;
    document.getElementById("severityScore").textContent =
      userData.severityScore;
    document.getElementById("organRequired").textContent =
      userData.organRequired
        ? userData.organRequired.charAt(0).toUpperCase() +
          userData.organRequired.slice(1)
        : "None";

    // Update doctor information if available
    fetchDoctorDetails();

    // Update medical reports table
    updateReportsTable(userData);
  }

  // Fetch doctor details
  async function fetchDoctorDetails() {
    try {
      // In a real application, replace with actual API endpoint
      const response = await fetch(`http://localhost:3000/api/v1/user/doctor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctor details");
      }

      const data = await response.json();

      // Update doctor information
      document.getElementById("doctorName").textContent =
        data.doctor.name || "N/A";
      document.getElementById("doctorPhone").textContent =
        data.doctor.phone || "N/A";
      document.getElementById("doctorEmail").textContent =
        data.doctor.email || "N/A";
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      // Display placeholder if doctor details couldn't be fetched
      document.getElementById("doctorName").textContent =
        "Doctor information unavailable";
      document.getElementById("doctorPhone").textContent = "N/A";
      document.getElementById("doctorEmail").textContent = "N/A";
    }
  }

  // Update medical reports table
  function updateReportsTable(userData) {
    const reports = userData.medicalreports;
    const tableBody = document.getElementById("reportsTableBody");
    const noReportsDiv = document.getElementById("noReports");

    // Clear existing table rows
    tableBody.innerHTML = "";

    if (reports.length === 0) {
      // Show "no reports" message
      noReportsDiv.classList.remove("d-none");
      return;
    }

    // Hide "no reports" message
    noReportsDiv.classList.add("d-none");

    // Add reports to table
    reports.forEach((report, index) => {
      const row = document.createElement("tr");

      // Extract filename from path
      const fileName = report.split("/").pop();

      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${fileName.split("-")[1]}</td>
                <td class="text-end">
                    <button class="btn btn-primary btn-sm view-btn" data-report="${report}">View</button>
                </td>
            `;

      tableBody.appendChild(row);
    });

    // Add event listeners to view buttons
    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const reportPath = this.getAttribute("data-report");
        // Open report in new window or tab
        window.open(reportPath, "_blank");
      });
    });
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
