// frontend/js/dashboard.js - UPDATED VERSION
class Dashboard {
    constructor() {
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
            
            // Load real data from APIs
            await Promise.all([
                this.loadUserInfo(),
                this.loadActivities(),
                this.loadEmissionsSummary(),
                this.loadSuggestions()
            ]);
            
        } catch (error) {
            console.error('Dashboard data loading error:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadUserInfo() {
        const user = Session.getUser();
        if (user) {
            const welcomeElement = document.getElementById('welcomeTag') || document.getElementById('userWelcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Hello, ${user.first_name || user.username}`;
            }
        }
    }

    async loadActivities() {
    try {
        const activities = await API.getActivities();
        console.log('Dashboard activities:', activities);
        this.displayRecentActivities(activities.slice(0, 5));
        this.updateActivityStats(activities);
    } catch (error) {
        console.error('Failed to load activities for dashboard:', error);
        // Show empty state
        this.displayRecentActivities([]);
    }
}

async loadEmissionsSummary() {
    try {
        const summary = await API.getEmissionsSummary();
        console.log('Emissions summary:', summary);
        this.updateCharts(summary);
        this.updateEmissionStats(summary);
    } catch (error) {
        console.error('Failed to load emissions summary:', error);
        // Show empty charts
        this.updateCharts({
            weekly_trend: [],
            by_category: [],
            total_emission: 0
        });
    }
}
    async loadSuggestions() {
        try {
            const suggestionsData = await API.getSuggestions();
            this.displaySuggestions(suggestionsData.suggestions || []);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
            this.displaySuggestions([]);
        }
    }

    updateActivityStats(activities) {
        const activityCount = document.getElementById('activityCount');
        if (activityCount) {
            activityCount.textContent = activities.length;
        }
    }

    updateEmissionStats(summary) {
        const todayEmission = document.getElementById('todayEmission');
        const weeklyEmission = document.getElementById('weeklyEmission');
        const savings = document.getElementById('savings');

        if (todayEmission) {
            // Calculate today's emission from weekly trend
            const today = new Date().toISOString().split('T')[0];
            const todayData = summary.weekly_trend.find(item => 
                item.date === today
            );
            todayEmission.textContent = (todayData?.daily_emission || 0).toFixed(1);
        }

        if (weeklyEmission) {
            weeklyEmission.textContent = summary.total_emission.toFixed(1);
        }

        // Savings calculation (you can implement your own logic)
        if (savings) {
            const savingsValue = -5.2; // Example value
            savings.textContent = `${savingsValue > 0 ? '+' : ''}${savingsValue.toFixed(1)}%`;
            savings.style.color = savingsValue > 0 ? '#28a745' : '#dc3545';
        }
    }

    updateCharts(summary) {
        // Weekly Trend Chart
        const weeklyCtx = document.getElementById('weeklyChart');
        if (weeklyCtx && summary.weekly_trend) {
            const labels = summary.weekly_trend.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
            });
            const data = summary.weekly_trend.map(item => item.daily_emission);

            this.charts = this.charts || {};
            
            if (this.charts.weekly) {
                this.charts.weekly.destroy();
            }

            this.charts.weekly = new Chart(weeklyCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Emissions (kg CO₂)',
                        data: data,
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
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx && summary.by_category) {
            const labels = summary.by_category.map(item => item.category_name);
            const data = summary.by_category.map(item => item.total_emission);

            if (this.charts.category) {
                this.charts.category.destroy();
            }

            this.charts.category = new Chart(categoryCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#ff6b6b', '#ffd93d']
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
            container.innerHTML = '<p>No suggestions available. Add more activities to get personalized suggestions.</p>';
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
        // You can add a toast notification here
        alert(message);
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