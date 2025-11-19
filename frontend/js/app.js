// frontend/js/app.js
class API {
    static baseUrl = '/api';

    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials,
        });
    }

    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });
    }

    static async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    static async getAuthStatus() {
        return this.request('/auth/status');
    }

    // Activities endpoints
    static async getActivities() {
        return this.request('/activities');
    }

    static async addActivity(activityData) {
        return this.request('/activities', {
            method: 'POST',
            body: activityData,
        });
    }

    static async updateActivity(id, activityData) {
        return this.request(`/activities/${id}`, {
            method: 'PUT',
            body: activityData,
        });
    }

    static async deleteActivity(id) {
        return this.request(`/activities/${id}`, {
            method: 'DELETE',
        });
    }

    // Emissions endpoints
    static async getEmissionsSummary() {
        return this.request('/emissions/summary');
    }

    static async getCategories() {
        return this.request('/emissions/categories');
    }

    static async getSuggestions() {
        return this.request('/emissions/suggestions');
    }
}

class Session {
    static getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static clear() {
        localStorage.removeItem('user');
    }

     static async checkAuth() {
        try {
            console.log('🔐 Checking authentication status...');
            const response = await API.getAuthStatus();
            console.log('Auth response:', response);
            
            if (response.authenticated) {
                this.setUser(response.user);
                console.log('✅ User authenticated:', response.user);
                return response.user;
            } else {
                this.clear();
                console.log('❌ User not authenticated');
                return null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.clear();
            return null;
        }
    }
}

// Auth functions
async function login(credentials) {
    try {
        const response = await API.login(credentials);
        Session.setUser(response.user);
        return response;
    } catch (error) {
        throw error;
    }
}

async function logout() {
    try {
        await API.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        Session.clear();
        window.location.href = 'index.html';
    }
}

async function register(userData) {
    try {
        const response = await API.register(userData);
        return response;
    } catch (error) {
        throw error;
    }
}

async function requireAuth() {
    const user = await Session.checkAuth();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Make functions globally available
window.API = API;
window.Session = Session;
window.login = login;
window.logout = logout;
window.register = register;
window.requireAuth = requireAuth;