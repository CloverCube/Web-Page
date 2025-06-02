document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/login.html";
    }
});