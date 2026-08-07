const checkbox = document.getElementById("task1");
const button = document.getElementById("helloButton");
const message = document.getElementById("message");

// Load saved checkbox state
checkbox.checked = localStorage.getItem("task1") === "true";

// Save checkbox state
checkbox.addEventListener("change", () => {
    localStorage.setItem("task1", checkbox.checked);
});

// Button example
button.addEventListener("click", () => {
    message.textContent = "JavaScript is working!";
});