// API configuration for CarbonIQ
class Config {
    static getApiBase() {
        return '/api'; // Relative path for same-origin serving
    }
    
    static getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }
    
    static async fetchWithAuth(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Include session cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        });

        if (response.status === 401) {
            window.location.href = '/index.html';
            throw new Error('Authentication required');
        }

        return response;
    }
}

window.Config = Config;