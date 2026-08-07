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


// Load steps.json
Promise.all([
    fetch("tasks.json").then(response => response.json()),
    fetch("steps.json").then(response => response.json())
])
    .then(([tasksData, stepsData]) => {

        const tasks = tasksData.tasks;
        const steps = stepsData.steps;

        steps.forEach(step => {

            const task = tasks.find(task => task.id === step.task_id);
            const stepDiv = document.createElement("div");

            let html = "";


            // Step is not attached to a task
            if (step.task_id === null) {

                html += `
                    <h3>${step.name}</h3>
                `;

            } else {

                html += `
                    <label>
                        <input type="checkbox" id="step-${step.id}">
                        <strong>${task.name}</strong>
                    </label>
                `;

                if (task) {

                    html += `
                        <p>
                            ${renderWikiLinks(task.description)}
                        </p>
                    `;

                }
            }


            // Only show notes if they exist
            if (step.notes && step.notes.trim() !== "") {

                html += `
                    <p>
                        <em>${renderWikiLinks(step.notes)}</em>
                    </p>
                `;

            }


            html += "<hr>";

            stepDiv.innerHTML = html;

            taskList.appendChild(stepDiv);


            // Save checkbox state only for task steps
            if (step.task_id !== null) {

                const checkbox =
                    document.getElementById(`step-${step.id}`);


                checkbox.checked =
                    localStorage.getItem(`step-${step.id}`) === "true";


                checkbox.addEventListener("change", () => {

                    localStorage.setItem(
                        `step-${step.id}`,
                        checkbox.checked
                    );

                });

            }

        });

    })
    .catch(error => {

        taskList.textContent = "Failed to load steps.";

        console.error(error);

    });