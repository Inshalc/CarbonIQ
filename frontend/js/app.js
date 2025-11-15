const Session = {
  setUser(user) { 
    localStorage.setItem('user', JSON.stringify(user)); 
    this.updateUserInActivities(user);
  },
  getUser() { 
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;
    
    this.loadUserData(user.id);
    return user;
  },
  clear() { 
    localStorage.removeItem('user'); 
  },
  
  saveAllData() {
    localStorage.setItem('carboniq_categories', JSON.stringify(MockDB.categories));
    localStorage.setItem('carboniq_activities', JSON.stringify(MockDB.activities));
    localStorage.setItem('carboniq_tips', JSON.stringify(MockDB.tips));
    localStorage.setItem('carboniq_users', JSON.stringify(MockDB.users));
    localStorage.setItem('carboniq_activity_templates', JSON.stringify(MockDB.activityTemplates));
  },
  
  loadAllData() {
    const savedCategories = localStorage.getItem('carboniq_categories');
    const savedActivities = localStorage.getItem('carboniq_activities');
    const savedTips = localStorage.getItem('carboniq_tips');
    const savedUsers = localStorage.getItem('carboniq_users');
    const savedTemplates = localStorage.getItem('carboniq_activity_templates');
    
    if (savedCategories) MockDB.categories = JSON.parse(savedCategories);
    if (savedActivities) MockDB.activities = JSON.parse(savedActivities);
    if (savedTips) MockDB.tips = JSON.parse(savedTips);
    if (savedUsers) MockDB.users = JSON.parse(savedUsers);
    if (savedTemplates) MockDB.activityTemplates = JSON.parse(savedTemplates);
  },
  
  loadUserData(userId) {
    this.loadAllData();
  },
  
  updateUserInActivities(user) {
    const existingUser = MockDB.users.find(u => u.id === user.id);
    if (!existingUser) {
      MockDB.users.push(user);
      this.saveAllData();
    }
  }
};

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
    { id: 6, name: 'Water Use', icon: 'fa-tint' },
    { id: 7, name: 'Travel', icon: 'fa-plane' },
    { id: 8, name: 'Work/Office', icon: 'fa-briefcase' },
    { id: 9, name: 'Home', icon: 'fa-home' },
    { id: 10, name: 'Community', icon: 'fa-users' }
  ],
  activities: [
    { id: 1, name: 'Drive Car 10 km', user_id: 1, category_id: 1, unit: 'km', co2: 2.3, quantity: 10, date: '2025-11-10' },
    { id: 2, name: 'Eat Beef Meal', user_id: 1, category_id: 2, unit: 'meal', co2: 27, quantity: 1, date: '2025-11-11' }
  ],
  activityTemplates: [
    { id: 1, name: 'Drive Car', category_id: 1, default_unit: 'km', co2_per_unit: 0.23, description: 'Gasoline car travel' },
    { id: 2, name: 'Take Bus', category_id: 1, default_unit: 'km', co2_per_unit: 0.08, description: 'Public bus transportation' },
    { id: 3, name: 'Eat Beef', category_id: 2, default_unit: 'meal', co2_per_unit: 27, description: 'Beef-based meal' },
    { id: 4, name: 'Eat Chicken', category_id: 2, default_unit: 'meal', co2_per_unit: 6.9, description: 'Chicken-based meal' },
    { id: 5, name: 'Eat Vegetarian', category_id: 2, default_unit: 'meal', co2_per_unit: 2.5, description: 'Plant-based meal' },
    { id: 6, name: 'Use Electricity', category_id: 3, default_unit: 'kWh', co2_per_unit: 0.5, description: 'Grid electricity consumption' },
    { id: 7, name: 'Heating (Natural Gas)', category_id: 3, default_unit: 'hour', co2_per_unit: 0.2, description: 'Home heating with natural gas' },
    { id: 8, name: 'Buy New Clothes', category_id: 4, default_unit: 'item', co2_per_unit: 15, description: 'New clothing purchase' },
    { id: 9, name: 'Recycle Paper', category_id: 5, default_unit: 'kg', co2_per_unit: -0.8, description: 'Paper recycling (negative emission)' },
    { id: 10, name: 'Shower', category_id: 6, default_unit: 'minute', co2_per_unit: 0.05, description: 'Hot water shower' }
  ],
  tips: [
    { id: 1, category_id: 2, text: 'Try a plant-based meal', level: 'high' },
    { id: 2, category_id: 1, text: 'Use public transport instead of driving', level: 'medium' },
    { id: 3, category_id: 3, text: 'Switch off unused lights', level: 'low' },
    { id: 4, category_id: 5, text: 'Recycle plastics and paper', level: 'low' },
    { id: 5, category_id: 6, text: 'Take shorter showers', level: 'medium' },
    { id: 6, category_id: 1, text: 'Consider electric vehicles for your next car', level: 'high' },
    { id: 7, category_id: 4, text: 'Buy local produce to reduce transport emissions', level: 'medium' },
    { id: 8, category_id: 3, text: 'Install solar panels for renewable energy', level: 'high' }
  ]
};

Session.loadAllData();

const GradingSystem = {
  calculateGrade(totalEmissions) {
    if (totalEmissions <= 50) return { grade: 'A', color: '#22c55c', description: 'Excellent' };
    if (totalEmissions <= 100) return { grade: 'B', color: '#a3e635', description: 'Good' };
    if (totalEmissions <= 200) return { grade: 'C', color: '#facc15', description: 'Average' };
    if (totalEmissions <= 300) return { grade: 'D', color: '#fb923c', description: 'Poor' };
    return { grade: 'F', color: '#ef4444', description: 'Critical' };
  },
  
  getTipsByLevel(level) {
    return MockDB.tips.filter(tip => tip.level === level);
  },
  
  getPersonalizedTips(userId) {
    const userActivities = MockDB.activities.filter(a => a.user_id === userId);
    const highEmissionCategories = this.getHighEmissionCategories(userActivities);
    
    return MockDB.tips.filter(tip => 
      highEmissionCategories.includes(tip.category_id) || tip.level === 'high'
    );
  },
  
  getHighEmissionCategories(activities) {
    const categoryEmissions = {};
    activities.forEach(activity => {
      if (!categoryEmissions[activity.category_id]) {
        categoryEmissions[activity.category_id] = 0;
      }
      categoryEmissions[activity.category_id] += activity.co2;
    });
    
    return Object.keys(categoryEmissions)
      .filter(catId => categoryEmissions[catId] > 10)
      .map(catId => parseInt(catId));
  }
};

const ActivityTemplates = {
  getAllTemplates() {
    return MockDB.activityTemplates;
  },
  
  getTemplatesByCategory(categoryId) {
    return MockDB.activityTemplates.filter(template => template.category_id === categoryId);
  },
  
  calculateCO2(templateId, quantity) {
    const template = MockDB.activityTemplates.find(t => t.id === templateId);
    if (!template) return 0;
    
    return quantity * template.co2_per_unit;
  },
  
  getTemplateDetails(templateId) {
    return MockDB.activityTemplates.find(t => t.id === templateId);
  }
};

const API = {
  login: async (username, password) => {
    const user = MockDB.users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (userData) => {
    const existingUser = MockDB.users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) throw new Error('Username or email already exists');
    
    const newUser = {
      id: MockDB.users.length + 1,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      password: userData.password
    };
    
    MockDB.users.push(newUser);
    Session.saveAllData();
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      token: 'mock-jwt-token-' + Date.now()
    };
  },

  getActivitiesByUser: async (userId) => {
    return MockDB.activities.filter(a => a.user_id === userId);
  },
  
  addActivity: async (payload) => {
    const id = (MockDB.activities.at(-1)?.id || 0) + 1;
    const activity = { id, ...payload };
    MockDB.activities.push(activity);
    
    Session.saveAllData();
    return activity;
  },

  getActivityTemplates: async () => MockDB.activityTemplates,
  getTemplatesByCategory: async (categoryId) => ActivityTemplates.getTemplatesByCategory(categoryId),
  calculateCO2FromTemplate: async (templateId, quantity) => ActivityTemplates.calculateCO2(templateId, quantity),
  getTemplateDetails: async (templateId) => ActivityTemplates.getTemplateDetails(templateId),

  getReportsByUser: async (userId) => {
    const activities = MockDB.activities.filter(a => a.user_id === userId);
    return activities.map(a => ({
      id: a.id,
      date: a.date,
      total_emission: a.co2
    }));
  },

  getTips: async () => MockDB.tips,
  getPersonalizedTips: async (userId) => GradingSystem.getPersonalizedTips(userId),
  
  getUserGrade: async (userId) => {
    const activities = await API.getActivitiesByUser(userId);
    const totalEmissions = activities.reduce((sum, activity) => sum + activity.co2, 0);
    return GradingSystem.calculateGrade(totalEmissions);
  },
  
  exportUserData: async (userId) => {
    const activities = await API.getActivitiesByUser(userId);
    const grade = await API.getUserGrade(userId);
    
    return {
      user: MockDB.users.find(u => u.id === userId),
      activities: activities,
      grade: grade,
      exportDate: new Date().toISOString(),
      totalActivities: activities.length,
      totalEmissions: activities.reduce((sum, a) => sum + a.co2, 0)
    };
  }
};

function requireAuth() {
  if (!Session.isAuthenticated()) {
    window.location.href = 'index.html';
    return null;
  }
  
  const user = Session.getUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  
  return user;
}

function logout() {
  Session.clear();
  window.location.href = 'index.html';
}

Session.isAuthenticated = () => {
  return !!localStorage.getItem('user');
};

document.addEventListener('DOMContentLoaded', function() {
  const protectedPages = ['dashboard.html', 'activity.html', 'suggestion.html', 'report.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage) && !Session.isAuthenticated()) {
    window.location.href = 'index.html';
  }
  
  const authPages = ['index.html', 'register.html'];
  if (authPages.includes(currentPage) && Session.isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
});