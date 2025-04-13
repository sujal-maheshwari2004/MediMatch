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
    fetchAdminData();
    fetchAllUsers();
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

    // Search input handler
    document
      .getElementById("searchInput")
      .addEventListener("keyup", function () {
        filterUsers(this.value);
      });
  }

  // Fetch admin data from backend
  async function fetchAdminData() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/admin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();

      // Update admin info
      document.getElementById("username").textContent =
        data.data.name || "Admin";
      document.getElementById("welcomeUsername").textContent =
        data.data.name || "Admin";
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }

  // Fetch all users data from backend
  async function fetchAllUsers() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/admin/allUsers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      updateUsersTable(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Show no users message
      document.getElementById("noUsers").classList.remove("d-none");
    }
  }

  // Update users table with data
  function updateUsersTable(users) {
    console.log("Users: ", users);
    const tableBody = document.getElementById("rankingsTableBody");
    const noUsers = document.getElementById("noUsers");

    // Clear existing rows
    tableBody.innerHTML = "";

    if (!users || users.length === 0) {
      noUsers.classList.remove("d-none");
      return;
    }

    // Hide no users message
    noUsers.classList.add("d-none");

    // Sort users by rank
    users.sort((a, b) => a.currentRank - b.currentRank);

    // Add user rows to table
    users.forEach((user) => {
      const row = document.createElement("tr");

      // Determine severity class based on score
      let severityClass = "";
      if (user.severityScore > 70) {
        severityClass = "severity-high";
      } else if (user.severityScore > 40) {
        severityClass = "severity-medium";
      } else {
        severityClass = "severity-low";
      }

      row.innerHTML = `
        <td>${user.currentRank}</td>
        <td>${user.name}</td>
        <td>${user.designatedDoctor?.name || "None"}</td>
        <td class="${severityClass}">${user.severityScore}</td>
        <td>
          <button class="btn btn-sm btn-primary view-details-btn" data-user-email="${
            user.email
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
        const userEmail = this.getAttribute("data-user-email");
        showUserDetails(userEmail);
      });
    });
  }

  // Filter users based on search input
  function filterUsers(searchTerm) {
    const tableRows = document.querySelectorAll("#rankingsTableBody tr");
    const searchTermLower = searchTerm.toLowerCase();

    tableRows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      if (rowText.includes(searchTermLower)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  // Show user details in modal
  async function showUserDetails(userEmail) {
    try {
      // Fetch user details
      const response = await fetch(
        `http://localhost:3000/api/v1/admin/user?email=${userEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      const user = data.user;

      // Update modal with user data
      document.getElementById("modalPatientName").textContent = user.name;
      document.getElementById("modalPatientEmail").textContent = user.email;
      document.getElementById("modalPatientPhone").textContent = user.phone;
      document.getElementById("modalOrganRequired").textContent =
        user.organRequired || "None";
      document.getElementById("modalBloodGroup").textContent =
        user.medicalDetails?.bloodGroup || "Unknown";
      document.getElementById("modalBloodPressure").textContent =
        user.medicalDetails?.bloodPressure || "Unknown";
      document.getElementById("modalHeartAttack").textContent =
        user.medicalDetails?.heartAttack === true ? "Yes" : "No" || "Unknown";
      document.getElementById("modalHeartValve").textContent =
        user.medicalDetails?.heartValve === true ? "Yes" : "No" || "Unknown";
      document.getElementById("modalHeartDefectByBirth").textContent =
        user.medicalDetails?.heartDefectByBirth === true
          ? "Yes"
          : "No" || "Unknown";
      document.getElementById("modalCardiomyopathy").textContent =
        user.medicalDetails?.cardiomyopathy === true
          ? "Yes"
          : "No" || "Unknown";

      // Update reports table
      const reportsTableBody = document.getElementById("modalReportsTableBody");
      const noReports = document.getElementById("modalNoReports");

      // Clear existing reports
      reportsTableBody.innerHTML = "";

      if (!user.medicalreports || user.medicalreports.length === 0) {
        noReports.classList.remove("d-none");
      } else {
        noReports.classList.add("d-none");

        // Add reports to table
        user.medicalreports.forEach((report) => {
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
        document.getElementById("userDetailsModal")
      );
      detailsModal.show();
    } catch (error) {
      console.error("Error showing user details:", error);
      alert("Failed to load user details. Please try again.");
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
