// Initialize Lucide icons
lucide.createIcons();

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');
const htmlEl = document.documentElement;

// Initialize theme
const currentTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateChartsTheme(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Chart Instances
let barChartInstance = null;
let scatterChartInstance = null;

// Core Logic Functions
function calculateEnergy(watts, hours) {
    return (watts * hours) / 1000;
}

function classifyUsage(energy, timeOfUse) {
    let statusClass = '';
    let title = '';
    let message = '';
    let icon = '';

    if (energy > 5) {
        statusClass = 'alert-danger';
        title = 'High Usage Detected';
        message = 'High usage — consider reducing operating time or shifting to off-peak hours to save costs.';
        icon = 'alert-triangle';
    } else if (energy > 2) {
        statusClass = 'alert-warning';
        title = 'Moderate Usage';
        message = 'Moderate usage — optimize for efficiency where possible.';
        icon = 'alert-circle';
    } else {
        statusClass = 'alert-success';
        title = 'Low Usage';
        message = 'Low usage — good job maintaining energy efficiency!';
        icon = 'check-circle';
    }

    let peakWarningMsg = '';
    if (timeOfUse === 'Morning' || timeOfUse === 'Evening') {
        peakWarningMsg = `⚠️ ${timeOfUse} is typically a peak hour. Shift usage to Afternoon or Night for cheaper rates if applicable.`;
    } else {
        peakWarningMsg = `✅ ${timeOfUse} is off-peak. Good scheduling!`;
    }

    return { statusClass, title, message, icon, peakWarningMsg };
}

// Form Submission Logic
const form = document.getElementById('energyForm');
const resultsPanel = document.getElementById('resultsPanel');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get Inputs
    const applianceName = document.getElementById('applianceName').value || 'Appliance';
    const watts = parseFloat(document.getElementById('powerRating').value);
    const hours = parseFloat(document.getElementById('dailyUsage').value);
    const rate = parseFloat(document.getElementById('electricityRate').value);
    const timeOfUse = document.getElementById('timeOfUse').value;

    // Calculations
    const energy = calculateEnergy(watts, hours);
    const dailyCost = energy * rate;
    const monthlyCost = dailyCost * 30;
    const annualCost = dailyCost * 365;

    const analysis = classifyUsage(energy, timeOfUse);

    // Update UI Metrics
    document.getElementById('metricEnergy').innerText = energy.toFixed(2);
    document.getElementById('metricDailyCost').innerText = dailyCost.toFixed(2);
    document.getElementById('metricMonthlyCost').innerText = monthlyCost.toFixed(2);
    document.getElementById('metricAnnualCost').innerText = annualCost.toFixed(2);

    // Update Alert Box
    const statusAlert = document.getElementById('statusAlert');
    statusAlert.className = `alert-box ${analysis.statusClass}`;

    document.getElementById('alertTitle').innerText = analysis.title;
    document.getElementById('alertMessage').innerText = analysis.message;

    const peakWarningEl = document.getElementById('peakWarning');
    peakWarningEl.innerText = analysis.peakWarningMsg;
    peakWarningEl.style.display = 'block';

    const alertIconEl = document.getElementById('alertIcon');
    alertIconEl.setAttribute('data-lucide', analysis.icon);

    // Re-render icons
    lucide.createIcons();

    // Reveal Results Panel
    resultsPanel.style.opacity = '1';
    resultsPanel.style.pointerEvents = 'auto';
    resultsPanel.classList.remove('animate-reveal');
    // trigger reflow
    void resultsPanel.offsetWidth;
    resultsPanel.classList.add('animate-reveal');

    // Render Charts
    renderCharts(applianceName, energy, hours);
});

// Chart Rendering
function getChartColors() {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#f8fafc' : '#111827',
        grid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.8)',
        primary: '#3b82f6',
        secondary: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    };
}

function renderCharts(appName, appEnergy, appHours) {
    const colors = getChartColors();
    Chart.defaults.color = colors.text;
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Bar Chart: Benchmark
    const barCtx = document.getElementById('barChart').getContext('2d');

    if (barChartInstance) barChartInstance.destroy();

    const benchmarks = {
        'Fan': 0.6,
        'Fridge': 1.5,
        'Washing Machine': 0.8,
        'AC': 6.0
    };

    const labels = [...Object.keys(benchmarks), appName];
    const dataPoints = [...Object.values(benchmarks), appEnergy];

    // Color the user's appliance differently
    const bgColors = labels.map(l => l === appName ? colors.primary : colors.grid);

    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Energy (kWh)',
                data: dataPoints,
                backgroundColor: bgColors,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: colors.grid }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // 2. Scatter Plot: Hours vs Energy
    const scatterCtx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChartInstance) scatterChartInstance.destroy();

    // Generate some simulated data points
    const simulatedData = [
        { x: 2, y: 0.5, label: 'Fan' },
        { x: 24, y: 1.5, label: 'Fridge' },
        { x: 1, y: 0.8, label: 'Washing Machine' },
        { x: 4, y: 6.0, label: 'AC' },
        { x: 5, y: 0.2, label: 'TV' },
        { x: 0.5, y: 0.6, label: 'Microwave' },
    ];

    scatterChartInstance = new Chart(scatterCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Typical Appliances',
                    data: simulatedData,
                    backgroundColor: colors.grid,
                    pointRadius: 6,
                },
                {
                    label: appName + ' (Your Input)',
                    data: [{ x: appHours, y: appEnergy }],
                    backgroundColor: colors.danger,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const point = context.raw;
                            return `${point.label || context.dataset.label}: ${point.x}hrs, ${point.y.toFixed(2)}kWh`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Hours Used' },
                    grid: { color: colors.grid }
                },
                y: {
                    title: { display: true, text: 'Energy (kWh)' },
                    grid: { color: colors.grid }
                }
            }
        }
    });
}

function updateChartsTheme(theme) {
    if (barChartInstance && scatterChartInstance) {
        const colors = getChartColors();

        Chart.defaults.color = colors.text;

        // Update Bar Chart
        barChartInstance.options.scales.x.grid.color = colors.grid;
        barChartInstance.options.scales.y.grid.color = colors.grid;
        // Re-evaluate colors for dataset
        const appName = document.getElementById('applianceName').value || 'Appliance';
        barChartInstance.data.datasets[0].backgroundColor = barChartInstance.data.labels.map(l => l === appName ? colors.primary : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'));
        barChartInstance.update();

        // Update Scatter Chart
        scatterChartInstance.options.scales.x.grid.color = colors.grid;
        scatterChartInstance.options.scales.y.grid.color = colors.grid;
        scatterChartInstance.data.datasets[0].backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        scatterChartInstance.update();
    }
}
