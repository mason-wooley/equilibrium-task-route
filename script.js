const taskList = document.getElementById("taskList");


// Convert RuneScape Wiki links into clickable links
function renderWikiLinks(text) {
    return text.replace(
        /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
        (match, page, label) => {
            const displayText = label || page;

            const url =
                "https://runescape.wiki/w/" +
                encodeURIComponent(page.replace(/ /g, "_"));

            return `<a href="${url}" target="_blank">${displayText}</a>`;
        }
    );
}


// Load tasks.json
fetch("tasks.json")
    .then(response => response.json())
    .then(data => {

        data.tasks.forEach(task => {

            const taskDiv = document.createElement("div");

            taskDiv.innerHTML = `
                <label>
                    <input type="checkbox" id="task-${task.id}">
                    <strong>${task.name}</strong>
                </label>

                <p>
                    ${renderWikiLinks(task.description)}
                </p>

                <hr>
            `;

            taskList.appendChild(taskDiv);


            // Save checkbox state
            const checkbox = document.getElementById(`task-${task.id}`);

            checkbox.checked =
                localStorage.getItem(`task-${task.id}`) === "true";


            checkbox.addEventListener("change", () => {
                localStorage.setItem(
                    `task-${task.id}`,
                    checkbox.checked
                );
            });

        });

    })
    .catch(error => {
        taskList.textContent = "Failed to load tasks.";
        console.error(error);
    });