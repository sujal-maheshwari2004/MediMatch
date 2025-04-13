document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Basic validation
    if (!email || !password || !role) {
      alert("Please fill in all fields");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Login attempt with:", {
      email: email,
      password: password,
      role: role,
    });

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error("Error in login", response.status);
      }

      const data = await response.json();
      console.log(data);

      // Redirect based on user role
      if (role === "user") {
        window.location.href = "pages/patient-dash.html";
      } else if (role === "doctor") {
        window.location.href = "pages/doctor-dash.html";
      } else if (role === "admin") {
        window.location.href = "pages/admin-dash.html";
      } else {
        // For admin role, use the original redirect
        window.location.href = `pages/success.html?role=${role}`;
      }
      return;
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please try again.");
      return;
    }
  });
});
