class ProfileManager {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        await this.loadProfileData();
        await this.loadActivityHistory();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/status`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.authenticated) {
                window.location.href = 'index.html';
                return;
            }

            this.currentUser = result.user;
            document.getElementById('userWelcome').textContent = `Welcome, ${result.user.first_name}!`;
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        }
    }

    bindEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('goalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.setGoal();
        });

        document.getElementById('dateRange').addEventListener('change', () => {
            this.filterActivities();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterActivities();
        });
    }

    async loadProfileData() {
        try {
            // Load user profile
            document.getElementById('profileInfo').innerHTML = `
                <div style="display: grid; gap: 1rem;">
                    <div><strong>Name:</strong> ${this.currentUser.first_name} ${this.currentUser.last_name}</div>
                    <div><strong>Username:</strong> ${this.currentUser.username}</div>
                    <div><strong>Member since:</strong> ${new Date().toLocaleDateString()}</div>
                    <div><strong>Activities logged:</strong> <span id="totalActivities">Loading...</span></div>
                </div>
            `;

            // Load user statistics
            await this.loadUserStats();
        } catch (error) {
            console.error('Profile data loading error:', error);
        }
    }

    async loadUserStats() {
        try {
            const [activitiesResponse, emissionsResponse] = await Promise.all([
                fetch(`${this.apiBase}/activities`, { credentials: 'include' }),
                fetch(`${this.apiBase}/emissions/summary`, { credentials: 'include' })
            ]);

            const activities = await activitiesResponse.json();
            const emissions = await emissionsResponse.json();

            // Update activities count
            document.getElementById('totalActivities').textContent = activities.length;

            // Display statistics
            const statsHtml = `
                <div style="display: grid; gap: 1rem;">
                    <div><strong>Total Emissions:</strong> ${emissions.total_emission?.toFixed(1) || 0} kg CO₂</div>
                    <div><strong>Main Category:</strong> ${this.getMainCategory(emissions.by_category)}</div>
                    <div><strong>Average Daily:</strong> ${((emissions.total_emission || 0) / 7).toFixed(1)} kg CO₂</div>
                    <div><strong>Carbon Score:</strong> ${this.calculateCarbonScore(emissions.total_emission)}</div>
                </div>
            `;

            document.getElementById('userStats').innerHTML = statsHtml;
        } catch (error) {
            console.error('Stats loading error:', error);
            document.getElementById('userStats').innerHTML = '<div class="message error">Failed to load statistics</div>';
        }
    }

    getMainCategory(categories) {
        if (!categories || categories.length === 0) return 'N/A';
        
        const mainCategory = categories.reduce((max, category) => 
            category.total_emission > max.total_emission ? category : max
        );
        
        return mainCategory.category_name;
    }

    calculateCarbonScore(totalEmission) {
        if (!totalEmission) return 'N/A';
        
        const weeklyAverage = totalEmission / 52; // Convert to weekly average
        if (weeklyAverage < 50) return '🌱 Excellent';
        if (weeklyAverage < 100) return '✅ Good';
        if (weeklyAverage < 200) return '⚠️ Average';
        return '🔴 Needs Improvement';
    }

    async setGoal() {
        const formData = new FormData(document.getElementById('goalForm'));
        const goalData = {
            target_emission: parseFloat(formData.get('targetEmission')),
            target_date: formData.get('targetDate'),
            goal_type: formData.get('goalType')
        };

        try {
            // In a real app, you would save this to your backend
            localStorage.setItem('carbonGoal', JSON.stringify(goalData));
            
            this.showMessage('Goal set successfully!', 'success');
            document.getElementById('goalForm').reset();
            
            // Update goals display
            this.displayCurrentGoal(goalData);
        } catch (error) {
            this.showMessage('Failed to set goal', 'error');
            console.error('Goal setting error:', error);
        }
    }

    displayCurrentGoal(goalData) {
        const goalsSection = document.getElementById('goalsSection');
        const goalHtml = `
            <div class="message success" style="margin-bottom: 1rem;">
                <h4>Current Goal</h4>
                <p>Target: ${goalData.target_emission} kg CO₂/${goalData.goal_type}</p>
                <p>Target Date: ${new Date(goalData.target_date).toLocaleDateString()}</p>
                <p>Progress: <span id="goalProgress">Calculating...</span></p>
            </div>
        `;
        
        goalsSection.innerHTML = goalHtml + goalsSection.innerHTML;
        
        // Calculate progress (mock calculation)
        setTimeout(() => {
            const progress = Math.min(100, Math.random() * 100).toFixed(1);
            document.getElementById('goalProgress').textContent = `${progress}%`;
        }, 1000);
    }

    async loadActivityHistory() {
        await this.filterActivities();
    }

    async filterActivities() {
        const dateRange = document.getElementById('dateRange').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        try {
            const response = await fetch(`${this.apiBase}/activities`, {
                credentials: 'include'
            });
            let activities = await response.json();

            // Apply filters
            if (dateRange !== 'all') {
                const days = parseInt(dateRange);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                
                activities = activities.filter(activity => 
                    new Date(activity.start_date) >= cutoffDate
                );
            }

            if (categoryFilter !== 'all') {
                activities = activities.filter(activity => 
                    activity.category_id == categoryFilter
                );
            }

            this.displayActivityHistory(activities);
        } catch (error) {
            console.error('Activity history loading error:', error);
            document.getElementById('activityHistory').innerHTML = 
                '<div class="message error">Failed to load activity history</div>';
        }
    }

    displayActivityHistory(activities) {
        const container = document.getElementById('activityHistory');

        if (activities.length === 0) {
            container.innerHTML = '<div class="message info">No activities found for the selected filters.</div>';
            return;
        }

        // Calculate some statistics
        const totalEmissions = activities.reduce((sum, activity) => sum + activity.CO2_result, 0);
        const activitiesByCategory = this.groupByCategory(activities);

        const html = `
            <div style="margin-bottom: 2rem;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total Activities</h4>
                        <div class="value">${activities.length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Total Emissions</h4>
                        <div class="value">${totalEmissions.toFixed(1)}</div>
                        <div class="unit">kg CO₂</div>
                    </div>
                    <div class="stat-card">
                        <h4>Average per Activity</h4>
                        <div class="value">${(totalEmissions / activities.length).toFixed(2)}</div>
                        <div class="unit">kg CO₂</div>
                    </div>
                </div>
            </div>

            <h4>Activities</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Activity</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Emissions</th>
                    </tr>
                </thead>
                <tbody>
                    ${activities.slice(0, 20).map(activity => `
                        <tr>
                            <td>${new Date(activity.start_date).toLocaleDateString()}</td>
                            <td>${activity.activity_name}</td>
                            <td>${activity.category_name}</td>
                            <td>${activity.quantity} ${activity.unit}</td>
                            <td>${activity.CO2_result} kg CO₂</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${activities.length > 20 ? 
                `<p style="text-align: center; margin-top: 1rem;">Showing 20 of ${activities.length} activities</p>` : ''}
        `;

        container.innerHTML = html;
    }

    groupByCategory(activities) {
        const groups = {};
        activities.forEach(activity => {
            const category = activity.category_name;
            if (!groups[category]) {
                groups[category] = {
                    count: 0,
                    emissions: 0
                };
            }
            groups[category].count++;
            groups[category].emissions += activity.CO2_result;
        });
        return groups;
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.marginTop = '1rem';

        const goalsSection = document.getElementById('goalsSection');
        goalsSection.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Initialize profile manager
const profileManager = new ProfileManager();