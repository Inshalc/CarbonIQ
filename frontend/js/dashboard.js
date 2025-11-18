class Dashboard {
    constructor() {
        this.apiBase = '/api';
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('Dashboard initializing...');
        
        // Check if we're on dashboard page
        if (!window.location.pathname.includes('dashboard.html')) {
            return;
        }
        
        await this.loadDashboardData();
        this.bindEvents();
    }

    bindEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    async loadDashboardData() {
        try {
            console.log('Loading dashboard data...');
            
            // Mock data for now - you can replace with actual API calls
            this.displayMockData();
            
        } catch (error) {
            console.error('Dashboard data loading error:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    displayMockData() {
        // Welcome message
        const user = Session.getUser();
        if (user) {
            const welcomeElement = document.getElementById('welcomeTag') || document.getElementById('userWelcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Hello, ${user.first_name || user.username}`;
            }
        }

        // Mock stats
        this.updateStats({
            todayEmission: 5.2,
            weeklyEmission: 34.7,
            activityCount: 8,
            savings: -12.5
        });

        // Mock charts
        this.createMockCharts();

        // Mock recent activities
        this.displayRecentActivities([
            { activity_name: 'Drive to work', category_name: 'Transportation', CO2_result: 2.3, start_date: '2024-01-15' },
            { activity_name: 'Electricity usage', category_name: 'Energy', CO2_result: 1.8, start_date: '2024-01-15' },
            { activity_name: 'Lunch', category_name: 'Diet', CO2_result: 3.1, start_date: '2024-01-14' }
        ]);

        // Mock suggestions
        this.displaySuggestions([
            { title: 'Use Public Transport', description: 'Try taking the bus or train to reduce emissions by up to 50%.' },
            { title: 'Energy Efficient Lighting', description: 'Switch to LED bulbs to save energy and reduce emissions.' }
        ]);
    }

    updateStats(data) {
        const todayEmission = document.getElementById('todayEmission');
        const weeklyEmission = document.getElementById('weeklyEmission');
        const activityCount = document.getElementById('activityCount');
        const savings = document.getElementById('savings');

        if (todayEmission) todayEmission.textContent = data.todayEmission.toFixed(1);
        if (weeklyEmission) weeklyEmission.textContent = data.weeklyEmission.toFixed(1);
        if (activityCount) activityCount.textContent = data.activityCount;
        if (savings) {
            savings.textContent = `${data.savings > 0 ? '+' : ''}${data.savings.toFixed(1)}%`;
            savings.style.color = data.savings > 0 ? '#28a745' : '#dc3545';
        }
    }

    createMockCharts() {
        // Weekly Trend Chart
        const weeklyCtx = document.getElementById('weeklyChart');
        if (weeklyCtx) {
            this.charts.weekly = new Chart(weeklyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Daily Emissions (kg CO₂)',
                        data: [4.2, 5.1, 3.8, 6.2, 5.7, 4.9, 5.2],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Weekly Carbon Emission Trend' }
                    }
                }
            });
        }

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            this.charts.category = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Transport', 'Diet', 'Energy', 'Shopping'],
                    datasets: [{
                        data: [12, 8, 6, 3],
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4ecdc4']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Emissions by Category' }
                    }
                }
            });
        }
    }

    displayRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p>No activities logged yet. <a href="activities.html">Log your first activity!</a></p>';
            return;
        }

        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Activity</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Emissions</th>
                    </tr>
                </thead>
                <tbody>
                    ${activities.slice(0, 5).map(activity => `
                        <tr>
                            <td>${activity.activity_name}</td>
                            <td>${activity.category_name}</td>
                            <td>${new Date(activity.start_date).toLocaleDateString()}</td>
                            <td>${activity.CO2_result} kg CO₂</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.innerHTML = '<p>No suggestions available at the moment.</p>';
            return;
        }

        const html = `
            <div style="display: grid; gap: 1rem;">
                ${suggestions.map(suggestion => `
                    <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
                        <strong>${suggestion.title}</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #666;">${suggestion.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML = html;
    }

    async logout() {
        await logout();
    }

    showError(message) {
        console.error('Dashboard error:', message);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        console.log('Initializing dashboard...');
        new Dashboard();
    }
});