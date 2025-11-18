// Simple session management for frontend
const Session = {
  setUser(user) { 
    localStorage.setItem('user', JSON.stringify(user)); 
  },
  getUser() { 
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user;
    } catch (e) {
      return null;
    }
  },
  clear() { 
    localStorage.removeItem('user'); 
  },
  isAuthenticated() {
    return !!this.getUser();
  }
};

// Mock database for frontend (fallback)
const MockDB = {
  users: [
    { id: 1, name: 'Zainab Lawal', username: 'zlawal', password: 'hash1' },
    { id: 2, name: 'Inshal Chauhdry', username: 'ichauhdry', password: 'hash2' },
    { id: 3, name: 'Armaan Parmar', username: 'aparmar', password: 'hash3' }
  ],
  categories: [
    { id: 1, name: 'Transportation', icon: 'fa-car' },
    { id: 2, name: 'Diet', icon: 'fa-utensils' },
    { id: 3, name: 'Energy', icon: 'fa-bolt' },
    { id: 4, name: 'Shopping', icon: 'fa-shopping-bag' },
    { id: 5, name: 'Waste', icon: 'fa-recycle' },
    { id: 6, name: 'Water Use', icon: 'fa-tint' }
  ],
  activities: [],
  tips: []
};

// Add this API object to your existing app.js file
const API = {
  // Check backend authentication status
  async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { authenticated: false, user: null };
    }
  },

  // Logout from backend
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get activities for user
  async getActivitiesByUser(userId) {
    try {
      const response = await fetch('/api/activities', {
        credentials: 'include'
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Get activities error:', error);
      return [];
    }
  },

  // Add new activity
  async addActivity(activityData) {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add activity');
      }

      return await response.json();
    } catch (error) {
      console.error('Add activity error:', error);
      throw error;
    }
  },

  // Get activity templates
  async getActivityTemplates() {
    try {
      // For now, return mock templates - you can replace with actual API call
      return [
        { id: 1, name: 'Drive Car', category_id: 1, default_unit: 'km', co2_per_unit: 0.23, description: 'Gasoline car travel' },
        { id: 2, name: 'Take Bus', category_id: 1, default_unit: 'km', co2_per_unit: 0.08, description: 'Public bus transportation' },
        { id: 3, name: 'Eat Beef', category_id: 2, default_unit: 'meal', co2_per_unit: 27, description: 'Beef-based meal' },
        { id: 4, name: 'Eat Chicken', category_id: 2, default_unit: 'meal', co2_per_unit: 6.9, description: 'Chicken-based meal' },
        { id: 5, name: 'Eat Vegetarian', category_id: 2, default_unit: 'meal', co2_per_unit: 2.5, description: 'Plant-based meal' },
        { id: 6, name: 'Use Electricity', category_id: 3, default_unit: 'kWh', co2_per_unit: 0.5, description: 'Grid electricity consumption' }
      ];
    } catch (error) {
      console.error('Get templates error:', error);
      return [];
    }
  },

  // Get user reports
  async getReportsByUser(userId) {
    try {
      // Mock implementation - replace with actual API call
      return [];
    } catch (error) {
      console.error('Get reports error:', error);
      return [];
    }
  },

  // Get user grade
  async getUserGrade(userId) {
    try {
      // Mock implementation
      return { grade: 'B', description: 'Good' };
    } catch (error) {
      console.error('Get grade error:', error);
      return { grade: 'N/A', description: 'No data' };
    }
  },

  // Get personalized tips
  async getPersonalizedTips(userId) {
    try {
      // Mock implementation
      return [
        { id: 1, category_id: 1, text: 'Use public transport instead of driving', level: 'high' },
        { id: 2, category_id: 2, text: 'Try a plant-based meal', level: 'medium' }
      ];
    } catch (error) {
      console.error('Get tips error:', error);
      return [];
    }
  },

  // Get all tips
  async getTips() {
    try {
      // Mock implementation
      return [
        { id: 1, category_id: 1, text: 'Use public transport', level: 'high' },
        { id: 2, category_id: 2, text: 'Eat less meat', level: 'medium' },
        { id: 3, category_id: 3, text: 'Turn off lights', level: 'low' }
      ];
    } catch (error) {
      console.error('Get tips error:', error);
      return [];
    }
  }
};