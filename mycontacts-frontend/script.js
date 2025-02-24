document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const contactsList = document.getElementById("contactsList");
    const logoutButton = document.getElementById("logout");

    // ✅ Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const response = await fetch("http://localhost:5000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login successful!");
                localStorage.setItem("token", data.token); // Save token
                window.location.href = "home.html"; // Redirect to Home Page
            } else {
                alert(data.message);
            }
        });
    }

    // ✅ Handle Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const response = await fetch("http://localhost:5000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "index.html";
            } else {
                alert(data.message);
            }
        });
    }

    // ✅ Fetch Contacts on Home Page
    if (contactsList) {
        async function fetchContacts() {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Unauthorized! Please login.");
                window.location.href = "index.html";
                return;
            }

            const response = await fetch("http://localhost:5000/api/contacts", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Include JWT
                },
            });

            const data = await response.json();
            if (response.ok) {
                contactsList.innerHTML = data.map(contact => 
                    `<li>${contact.name} - ${contact.email} - ${contact.phone}</li>`
                ).join("");
            } else {
                alert("Failed to fetch contacts. Please login again.");
                localStorage.removeItem("token");
                window.location.href = "index.html";
            }
        }

        fetchContacts();
    }

    // ✅ Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }
});
