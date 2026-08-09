const taskList = document.getElementById("taskList");
const completedCount = document.getElementById("completedCount");
const leaguePoints = document.getElementById("leaguePoints");
const resetButton = document.getElementById("resetButton");
const scrollTopButton = document.getElementById("scrollTopButton");
const scrollNextButton = document.getElementById("scrollNextButton");

const tierPoints = {
    easy: 10,
    medium: 30,
    hard: 80,
    elite: 200,
    master: 400
};

const difficultyIcons = {
    easy: "https://runescape.wiki/images/Catalyst_League_tasks_-_Easy.png",
    medium: "https://runescape.wiki/images/Catalyst_League_tasks_-_Medium.png",
    hard: "https://runescape.wiki/images/Catalyst_League_tasks_-_Hard.png",
    elite: "https://runescape.wiki/images/Catalyst_League_tasks_-_Elite.png",
    master: "https://runescape.wiki/images/Catalyst_League_tasks_-_Master.png"
};

const regionIcons = {
    global: "https://runescape.wiki/images/World_Map_icon.png",
    misthalin: "https://runescape.wiki/images/Misthalin_League_Region_Badge.png",
    havenhythe: "https://runescape.wiki/images/Havenhythe_League_Region_Badge.png",
    karamja: "https://runescape.wiki/images/Karamja_League_Region_Badge.png",
    anachronia: "https://runescape.wiki/images/Anachronia_League_Region_Badge.png",
    asgarnia: "https://runescape.wiki/images/Asgarnia_League_Region_Badge.png",
    fremennik: "https://runescape.wiki/images/Fremennik_League_Region_Badge.png",
    kandarin: "https://runescape.wiki/images/Kandarin_League_Region_Badge.png",
    desert: "https://runescape.wiki/images/Desert_League_Region_Badge.png",
    morytania: "https://runescape.wiki/images/Morytania_League_Region_Badge.png",
    tirannwn: "https://runescape.wiki/images/Tirannwn_League_Region_Badge.png",
    wilderness: "https://runescape.wiki/images/Wilderness_League_Region_Badge.png"
};


// Parse Wiki markdown and convert to link
function renderWikiLinks(text) {
    return text.replace(
        /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
        (match, page, label) => {
            const displayText = label || page;

            const url = "https://runescape.wiki/w/" + encodeURIComponent(page.replace(/ /g, "_"));

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

// Scroll to the first uncompleted step
function scrollToNextStep(behavior = "instant") {
    const firstUncompleted = taskList.querySelector(
        ".task-card:not(.completed)"
    );

    if (firstUncompleted) {
        const headerHeight = document.querySelector(".site-header").offsetHeight;
        const stepPosition = firstUncompleted.offsetTop - 30;

        taskList.scrollTo({
            top: stepPosition,
            behavior: behavior
        });
    }
}

// Scroll to the top of the task list
function scrollToTop() {
    taskList.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

scrollTopButton.addEventListener(
    "click",
    scrollToTop
);

scrollNextButton.addEventListener(
    "click",
    () => scrollToNextStep("smooth")
);

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

                const checkbox = document.getElementById(`step-${step.id}`);

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

        // Running total of all possible points up to the current task
        let cumulativePoints = 0;

        steps.forEach(step => {
            const task = tasks.find(task => task.id === step.task_id);

            if (task) {
                cumulativePoints += tierPoints[task.tier] || 0;
            }

            const stepDiv = document.createElement("div");
            stepDiv.className = "task-card";

            let html = "";

            // Add the checkbox
            html += `
            <div class="task-card-content">

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

            html += `
                </div>
            `;

            if (task) {
                html += `
                <div class="task-card-meta">
            `;


                // Difficulty icon
                if (task.tier && difficultyIcons[task.tier]) {
                    html += `
                    <div
                        class="task-meta-item"
                        title="${task.tier.charAt(0).toUpperCase() + task.tier.slice(1)} difficulty"
                    >
                        <img
                            src="${difficultyIcons[task.tier]}"
                            alt="${task.tier} difficulty"
                        >
                    </div>
                `;
                }


                // Region icon
                if (task.region && regionIcons[task.region]) {
                    html += `
                    <div
                        class="task-meta-item"
                        title="${task.region}"
                    >
                        <img
                            src="${regionIcons[task.region]}"
                            alt="${task.region} region"
                        >
                    </div>
                `;
                }


                // Cumulative points
                html += `
                <div
                    class="task-meta-points"
                    title="Estimated Total"
                >
                    <span>${cumulativePoints}</span>
                    <small>pts</small>
                </div>
            `;


                html += `
                </div>
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

        setTimeout(() => {
            scrollToNextStep();
        }, 100);
    })
    .catch(error => {
        taskList.textContent = "Failed to load steps.";

        console.error(error);
    });