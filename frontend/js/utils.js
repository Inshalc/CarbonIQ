// Utility functions for the frontend

class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatNumber(number, decimals = 2) {
        return parseFloat(number).toFixed(decimals);
    }

    static async fetchWithAuth(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = 'index.html';
            throw new Error('Authentication required');
        }

        return response;
    }

    static showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static calculateCarbonSavings(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((previous - current) / previous) * 100;
    }

    static getCarbonIntensityColor(intensity) {
        if (intensity < 10) return '#28a745'; // Green
        if (intensity < 20) return '#ffc107'; // Yellow
        if (intensity < 30) return '#fd7e14'; // Orange
        return '#dc3545'; // Red
    }
}

// Add CSS for notifications
const notificationStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export for use in other files
window.Utils = Utils;