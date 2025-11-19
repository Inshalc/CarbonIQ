class ActivitiesManager {
    constructor() {
        this.apiBase = '/api';
        this.categories = [];
        this.allActivities = [];
        this.activityTemplates = {
            'drive_car': { name: 'Drive Car', category: '1', unit: 'km', co2PerUnit: 0.23, description: 'Gasoline car travel' },
            'take_bus': { name: 'Take Bus', category: '1', unit: 'km', co2PerUnit: 0.08, description: 'Public bus transportation' },
            'eat_beef': { name: 'Eat Beef Meal', category: '2', unit: 'meal', co2PerUnit: 27, description: 'Beef-based meal' },
            'eat_chicken': { name: 'Eat Chicken Meal', category: '2', unit: 'meal', co2PerUnit: 6.9, description: 'Chicken-based meal' },
            'eat_vegetarian': { name: 'Eat Vegetarian Meal', category: '2', unit: 'meal', co2PerUnit: 2.5, description: 'Plant-based meal' },
            'use_electricity': { name: 'Use Electricity', category: '3', unit: 'kWh', co2PerUnit: 0.5, description: 'Grid electricity consumption' },
            'home_heating': { name: 'Home Heating', category: '3', unit: 'hour', co2PerUnit: 0.2, description: 'Home heating with natural gas' },
            'buy_clothes': { name: 'Buy New Clothes', category: '4', unit: 'item', co2PerUnit: 15, description: 'New clothing purchase' },
            'recycle_paper': { name: 'Recycle Paper', category: '5', unit: 'kg', co2PerUnit: -0.8, description: 'Paper recycling (negative emission)' },
            'take_shower': { name: 'Take Shower', category: '6', unit: 'minute', co2PerUnit: 0.05, description: 'Hot water shower' }
        };
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        await this.loadCategories();
        await this.loadActivities();
        this.setDefaultDate();
        this.setupActivityTemplates();
        this.setupSearchAndFilter();
    }

    async checkAuth() {
        try {
            const user = Session.getUser();
            if (!user) {
                window.location.href = 'index.html';
                return;
            }

            const welcomeElement = document.getElementById('userWelcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome, ${user.first_name || user.username}!`;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        }
    }

    bindEvents() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Form submission
        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleActivitySubmit();
            });
        }
    }

    setupActivityTemplates() {
        const activityType = document.getElementById('activityType');
        if (activityType) {
            activityType.addEventListener('change', function(e) {
                const selectedType = this.value;
                const quantityInput = document.getElementById('quantity');
                const co2Input = document.getElementById('co2');
                const co2Preview = document.getElementById('co2Preview');
                const co2Value = document.getElementById('co2Value');
                const co2Calculation = document.getElementById('co2Calculation');
                
                if (selectedType && activitiesManager.activityTemplates[selectedType]) {
                    const template = activitiesManager.activityTemplates[selectedType];
                    
                    // Auto-fill form fields
                    document.getElementById('category').value = template.category;
                    document.getElementById('unit').value = template.unit;
                    document.getElementById('activityName').value = template.name;
                    
                    // Set up real-time calculation
                    quantityInput.oninput = function() {
                        const quantity = parseFloat(this.value) || 0;
                        const co2 = template.co2PerUnit * quantity;
                        co2Input.value = co2.toFixed(2);
                        
                        // Show preview
                        co2Preview.style.display = 'block';
                        co2Value.textContent = `${co2.toFixed(2)} kg CO2e`;
                        co2Calculation.textContent = `${quantity} ${template.unit} × ${template.co2PerUnit} kg/${template.unit}`;
                    };
                    
                    // Trigger calculation if quantity already has value
                    if (quantityInput.value) {
                        quantityInput.oninput();
                    }
                } else {
                    // Clear auto-calculation if no template selected
                    quantityInput.oninput = null;
                    co2Preview.style.display = 'none';
                }
            });
        }
    }

    setupSearchAndFilter() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterActivities());
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => this.filterActivities());
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterActivities());
        }

        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterActivities());
        }

        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterActivities());
        }

        // Reset filters
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', () => this.resetFilters());
        }
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    async loadCategories() {
        try {
            // Mock categories - you can replace with API call
            this.categories = [
                { category_id: 1, name: 'Transportation' },
                { category_id: 2, name: 'Diet' },
                { category_id: 3, name: 'Energy' },
                { category_id: 4, name: 'Shopping' },
                { category_id: 5, name: 'Waste' },
                { category_id: 6, name: 'Water Use' },
                { category_id: 7, name: 'Travel' },
                { category_id: 8, name: 'Work/Office' },
                { category_id: 9, name: 'Home' },
                { category_id: 10, name: 'Community' }
            ];
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    async handleActivitySubmit() {
        const user = Session.getUser();
        if (!user) {
            this.showMessage('Please log in first', 'error');
            return;
        }

        // Get form values
        const activityName = document.getElementById('activityName')?.value;
        const category = document.getElementById('category')?.value;
        const quantity = parseFloat(document.getElementById('quantity')?.value);
        const unit = document.getElementById('unit')?.value;
        const co2 = parseFloat(document.getElementById('co2')?.value);
        const date = document.getElementById('date')?.value;

        console.log('Form values:', { activityName, category, quantity, unit, co2, date });

        // Validation
        if (!activityName || !category || !quantity || !unit || !co2 || !date) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            this.showMessage('Please enter a valid quantity', 'error');
            return;
        }

        if (isNaN(co2) || co2 < 0) {
            this.showMessage('Please enter a valid CO2 value', 'error');
            return;
        }

        const activityData = {
            activity_name: activityName,
            category_id: parseInt(category),
            quantity: quantity,
            unit: unit,
            CO2_result: co2,
            start_date: date,
            end_date: date
        };

        console.log('Submitting activity:', activityData);

        try {
            const result = await API.addActivity(activityData);
            this.showMessage('Activity added successfully!', 'success');
            
            // Reset form but keep template behavior
            const activityForm = document.getElementById('activityForm');
            if (activityForm) {
                activityForm.reset();
                this.setDefaultDate();
            }
            
            // Hide CO2 preview
            const co2Preview = document.getElementById('co2Preview');
            if (co2Preview) {
                co2Preview.style.display = 'none';
            }
            
            // Clear activity type selection
            const activityType = document.getElementById('activityType');
            if (activityType) {
                activityType.value = '';
            }
            
            // Reload activities list
            await this.loadActivities();
            
        } catch (error) {
            console.error('Activity submission error:', error);
            this.showMessage(error.message || 'Failed to add activity. Please try again.', 'error');
        }
    }

        async loadActivities() {
    try {
        console.log('Loading activities from API...');
        const activities = await API.getActivities();
        console.log('Activities loaded:', activities);
        this.allActivities = activities;
        this.displayFilteredActivities(activities);
    } catch (error) {
        console.error('Failed to load activities:', error);
        this.showMessage('Failed to load activities. Please try again.', 'error');
        this.allActivities = [];
        this.displayFilteredActivities([]);
    }
}
        
        filterActivities() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

        let filteredActivities = [...this.allActivities];

        // Apply search filter
        if (searchTerm) {
            filteredActivities = filteredActivities.filter(activity => 
                activity.activity_name.toLowerCase().includes(searchTerm) ||
                (activity.description && activity.description.toLowerCase().includes(searchTerm))
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filteredActivities = filteredActivities.filter(activity => 
                activity.category_id === parseInt(categoryFilter)
            );
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filteredActivities = filteredActivities.filter(activity => {
                const activityDate = new Date(activity.start_date);
                
                switch(dateFilter) {
                    case 'today':
                        return activityDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return activityDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return activityDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filteredActivities.sort((a, b) => {
            switch(sortBy) {
                case 'date-desc':
                    return new Date(b.start_date) - new Date(a.start_date);
                case 'date-asc':
                    return new Date(a.start_date) - new Date(b.start_date);
                case 'emission-desc':
                    return b.CO2_result - a.CO2_result;
                case 'emission-asc':
                    return a.CO2_result - b.CO2_result;
                case 'name':
                    return a.activity_name.localeCompare(b.activity_name);
                default:
                    return 0;
            }
        });

        this.displayFilteredActivities(filteredActivities);
    }

    displayFilteredActivities(activities) {
        const container = document.getElementById('activitiesList');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');

        if (!container) return;

        // Hide loading state
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Update activity count
        this.updateActivityCount(activities.length, this.allActivities.length);

        if (activities.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            container.innerHTML = '';
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        const html = activities.map(activity => {
            const category = this.categories.find(cat => cat.category_id === activity.category_id);
            return `
                <tr>
                    <td>
                        <div class="fw-semibold small">${activity.activity_name}</div>
                        <small class="text-muted">${activity.description || ''}</small>
                    </td>
                    <td>
                        <span class="tag small">${category?.name || 'Unknown'}</span>
                    </td>
                    <td class="small">${new Date(activity.start_date).toLocaleDateString()}</td>
                    <td class="fw-bold small" style="color: var(--accent-light);">${activity.CO2_result} kg</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="activitiesManager.deleteActivity(${activity.activity_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = html;
    }

    updateActivityCount(filteredCount, totalCount) {
        const activityCountElement = document.getElementById('activityCount');
        if (activityCountElement) {
            if (filteredCount === totalCount) {
                activityCountElement.textContent = `${totalCount} activities`;
            } else {
                activityCountElement.textContent = `${filteredCount} of ${totalCount} activities`;
            }
        }
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('dateFilter').value = 'all';
        document.getElementById('sortBy').value = 'date-desc';
        this.filterActivities();
    }

    async deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/activities/${activityId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                this.showMessage('Activity deleted successfully', 'success');
                await this.loadActivities();
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to delete activity', 'error');
            }
        } catch (error) {
            console.error('Delete activity error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    editActivity(activityId) {
        this.showMessage('Edit functionality coming soon!', 'info');
    }

    async logout() {
        await logout();
    }

    showMessage(message, type = 'info') {
        // Remove any existing alerts first
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create alert element
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`;
        alertEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(alertEl, main.firstChild);
        }

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.remove();
            }
        }, 5000);
    }
}

// Initialize activities manager
const activitiesManager = new ActivitiesManager();

// Make it globally available for onclick handlers
window.activitiesManager = activitiesManager;