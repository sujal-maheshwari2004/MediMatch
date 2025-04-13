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

  // Current user data for modal actions
  let currentUserData = {
    email: "",
    role: "",
  };

  // Initialize page if user is authenticated
  if (checkAuth()) {
    initializePage();
    setupEventListeners();
  }

  // Initialize page data
  function initializePage() {
    fetchAdminData();
    fetchNewRegistrations();
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

    // Modal approve button
    document
      .getElementById("modalApproveBtn")
      .addEventListener("click", function () {
        approveUser(currentUserData.email, currentUserData.role);
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("userDetailsModal")
        );
        modal.hide();
      });

    // Modal reject button
    document
      .getElementById("modalRejectBtn")
      .addEventListener("click", function () {
        rejectUser(currentUserData.email, currentUserData.role);
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("userDetailsModal")
        );
        modal.hide();
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

  // Fetch new registrations from backend
  async function fetchNewRegistrations() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/admin/newRegistrations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch new registrations");
      }

      const data = await response.json();

      // Update tables
      updateUsersTable(data.data.users);
      updateDoctorsTable(data.data.doctors);
    } catch (error) {
      console.error("Error fetching new registrations:", error);
      document.getElementById("noNewUsers").classList.remove("d-none");
      document.getElementById("noNewDoctors").classList.remove("d-none");
    }
  }

  // Update users table with data
  function updateUsersTable(users) {
    const tableBody = document.getElementById("usersTableBody");
    const noUsers = document.getElementById("noNewUsers");

    // Clear existing rows
    tableBody.innerHTML = "";

    if (!users || users.length === 0) {
      noUsers.classList.remove("d-none");
      return;
    }

    // Hide no users message
    noUsers.classList.add("d-none");

    // Add user rows to table
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.age || "N/A"}</td>
        <td>${user.gender || "N/A"}</td>
        <td>${user.assignedDoctor?.name || "None"}</td>
        <td>
          <button class="btn btn-sm btn-primary view-details-btn" data-email="${
            user.email
          }" data-role="user">
            View Details
          </button>
        </td>
        <td>
          <button class="btn btn-sm btn-success approve-btn" data-email="${
            user.email
          }" data-role="user">
            Approve
          </button>
          <button class="btn btn-sm btn-danger reject-btn" data-email="${
            user.email
          }" data-role="user">
            Reject
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners to the view details buttons
    document
      .querySelectorAll(".view-details-btn[data-role='user']")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const email = this.getAttribute("data-email");
          const role = this.getAttribute("data-role");
          showUserDetails(
            email,
            role,
            users.find((u) => u.email === email)
          );
        });
      });

    // Add event listeners to the approve buttons
    document
      .querySelectorAll(".approve-btn[data-role='user']")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const email = this.getAttribute("data-email");
          const role = this.getAttribute("data-role");
          approveUser(email, role);
        });
      });

    // Add event listeners to the reject buttons
    document
      .querySelectorAll(".reject-btn[data-role='user']")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const email = this.getAttribute("data-email");
          const role = this.getAttribute("data-role");
          rejectUser(email, role);
        });
      });
  }

  // Update doctors table with data
  function updateDoctorsTable(doctors) {
    const tableBody = document.getElementById("doctorsTableBody");
    const noDoctors = document.getElementById("noNewDoctors");

    // Clear existing rows
    tableBody.innerHTML = "";

    if (!doctors || doctors.length === 0) {
      noDoctors.classList.remove("d-none");
      return;
    }

    // Hide no doctors message
    noDoctors.classList.add("d-none");

    // Add doctor rows to table
    doctors.forEach((doctor) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doctor.name}</td>
        <td>${doctor.department || "N/A"}</td>
        <td>${doctor.phone || "N/A"}</td>
        <td>
          <button class="btn btn-sm btn-success approve-btn" data-email="${
            doctor.email
          }" data-role="doctor">
            Approve
          </button>
          <button class="btn btn-sm btn-danger reject-btn" data-email="${
            doctor.email
          }" data-role="doctor">
            Reject
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners to the approve buttons
    document
      .querySelectorAll(".approve-btn[data-role='doctor']")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const email = this.getAttribute("data-email");
          const role = this.getAttribute("data-role");
          approveUser(email, role);
        });
      });

    // Add event listeners to the reject buttons
    document
      .querySelectorAll(".reject-btn[data-role='doctor']")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const email = this.getAttribute("data-email");
          const role = this.getAttribute("data-role");
          rejectUser(email, role);
        });
      });
  }

  // Show user details in modal
  function showUserDetails(email, role, userData) {
    // Store user data for modal actions
    currentUserData = {
      email: email,
      role: role,
    };

    // Fill modal with user data
    document.getElementById("modalUserName").textContent =
      userData.name || "N/A";
    document.getElementById("modalUserEmail").textContent =
      userData.email || "N/A";
    document.getElementById("modalUserPhone").textContent =
      userData.phone || "N/A";
    document.getElementById("modalUserAge").textContent = userData.age || "N/A";
    document.getElementById("modalUserGender").textContent =
      userData.gender || "N/A";

    // Show the modal
    const modal = new bootstrap.Modal(
      document.getElementById("userDetailsModal")
    );
    modal.show();
  }

  // Approve user function
  async function approveUser(email, role) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/admin/updateVerification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve user");
      }

      // Refresh the registration lists
      fetchNewRegistrations();

      // Show success message
      alert(`${role === "user" ? "User" : "Doctor"} approved successfully!`);
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve. Please try again.");
    }
  }

  // Reject user function (in a real app, this would call a different endpoint)
  async function rejectUser(email, role) {
    // Note: In a real application, this would call a specific endpoint for rejecting users
    // For now, we'll just refresh the page to simulate the action
    alert(`${role === "user" ? "User" : "Doctor"} rejected.`);
    fetchNewRegistrations();
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
