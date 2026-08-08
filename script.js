const taskList = document.getElementById("taskList");
const completedCount = document.getElementById("completedCount");
const leaguePoints = document.getElementById("leaguePoints");
const resetButton = document.getElementById("resetButton");

const tierPoints = {
    easy: 10,
    medium: 30,
    hard: 80,
    elite: 200,
    master: 400
};

// Parse Wiki markdown and convert to link
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

// Iterate over the steps and check against local storage to show correct checkbox state/point total
function updateProgress(steps, tasks) {
    let completed = 0;
    let points = 0;

    steps.forEach(step => {
        const completedStep = localStorage.getItem(`step-${step.id}`) === "true";

        if (completedStep && step.task_id != null) {
            completed++;

            const task = tasks.find(task => task.id === step.task_id);
            points += tierPoints[task.tier] || 0;
        }
    });

    completedCount.textContent = completed;
    leaguePoints.textContent = points;
}

// Load both tasks.json & steps.json
Promise.all([
    fetch("tasks.json").then(response => response.json()),
    fetch("steps.json").then(response => response.json())
])
    .then(([tasksData, stepsData]) => {
        const tasks = tasksData.tasks;

        // Order can be decimal values to rearrange things more easily
        const steps = stepsData.steps.sort(
            (a, b) => a.order - b.order
        );

        // Reset progress
        resetButton.addEventListener("click", () => {

            if (!confirm("Are you sure you want to reset all completed tasks?")) {
                return;
            }

            steps.forEach(step => {
                localStorage.removeItem(`step-${step.id}`);

                const checkbox =
                    document.getElementById(`step-${step.id}`);

                if (checkbox) {
                    checkbox.checked = false;

                    const taskCard = checkbox.closest(".task-card");

                    if (taskCard) {
                        taskCard.classList.remove("completed");
                    }
                }
            });

            updateProgress(steps, tasks);
        });

        steps.forEach(step => {
            const task = tasks.find(task => task.id === step.task_id);
            const stepDiv = document.createElement("div");
            stepDiv.className = "task-card";

            let html = "";

            // Add the checkbox
            html += `
                <label>
                    <input type="checkbox" id="step-${step.id}">
                    <strong>${task ? task.name : step.name}</strong>
                </label>
            `;

            // Only tasks have descriptions, steps have notes instead
            if (task) {
                html += `
                    <p>
                        ${renderWikiLinks(task.description)}
                    </p>
                `;
            }

            // Only show notes if they exist
            if (step.notes && step.notes.trim() !== "") {
                html += `
                    <p>
                        <em>${renderWikiLinks(step.notes)}</em>
                    </p>
                `;
            }

            stepDiv.innerHTML = html;

            taskList.appendChild(stepDiv);

            // Save checkbox state
            const checkbox = document.getElementById(`step-${step.id}`);

            checkbox.checked = localStorage.getItem(`step-${step.id}`) === "true";

            if (checkbox.checked) {
                stepDiv.classList.add("completed");
            }

            checkbox.addEventListener("change", () => {

                localStorage.setItem(
                    `step-${step.id}`,
                    checkbox.checked
                );

                checkbox.closest(".task-card")
                    ?.classList.toggle("completed", checkbox.checked);

                updateProgress(steps, tasks);
            });
        });

        updateProgress(steps, tasks);
    })
    .catch(error => {
        taskList.textContent = "Failed to load steps.";

        console.error(error);
    });