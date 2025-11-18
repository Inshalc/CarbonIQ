class AuthManager {
    constructor() {
        this.apiBase = '/api';
        this.currentUser = null;
        console.log('AuthManager initialized');
        this.init();
    }

    init() {
        console.log('Setting up auth events...');
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        console.log('Binding event listeners...');
        
        // Form toggling
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Show register clicked');
                this.showForm('register');
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Show login clicked');
                this.showForm('login');
            });
        }

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Register form submitted');
                this.handleRegister();
            });
        }
    }

    showForm(formType) {
        console.log('Showing form:', formType);
        // Hide all forms
        document.querySelectorAll('.form-container').forEach(form => {
            form.style.display = 'none';
        });
        // Show the selected form
        const targetForm = document.getElementById(`${formType}-form`);
        if (targetForm) {
            targetForm.style.display = 'block';
        }
        // Clear any messages
        this.hideMessage();
    }

    async handleLogin() {
        console.log('Starting login process...');
        
        // Get values directly from inputs by ID
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        
        console.log('Username input:', usernameInput);
        console.log('Password input:', passwordInput);
        
        if (!usernameInput || !passwordInput) {
            console.error('Login form inputs not found!');
            this.showMessage('Form error - please refresh the page', 'error');
            return;
        }

        const data = {
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        console.log('Login data being sent:', data);

        // Validation
        if (!data.username || !data.password) {
            this.showMessage('Please enter both username and password', 'error');
            return;
        }

        try {
            console.log('Sending login request to:', `${this.apiBase}/auth/login`);
            
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            console.log('Response status:', response.status);
            
            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok) {
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Store user in localStorage
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showMessage(result.error || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async handleRegister() {
        console.log('Starting registration process...');
        
        // Get values directly from inputs by ID
        const firstNameInput = document.getElementById('register-firstname');
        const lastNameInput = document.getElementById('register-lastname');
        const usernameInput = document.getElementById('register-username');
        const passwordInput = document.getElementById('register-password');
        
        console.log('Registration inputs:', {firstNameInput, lastNameInput, usernameInput, passwordInput});

        if (!firstNameInput || !lastNameInput || !usernameInput || !passwordInput) {
            console.error('Register form inputs not found!');
            this.showMessage('Form error - please refresh the page', 'error');
            return;
        }

        const data = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        console.log('Register data being sent:', data);

        // Validation
        if (!data.first_name || !data.last_name || !data.username || !data.password) {
            this.showMessage('All fields are required', 'error');
            return;
        }

        if (data.password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            console.log('Sending registration request...');
            
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            
            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                this.showForm('login');
                // Clear the form
                firstNameInput.value = '';
                lastNameInput.value = '';
                usernameInput.value = '';
                passwordInput.value = '';
            } else {
                this.showMessage(result.error || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBase}/auth/status`, {
                credentials: 'include'
            });
            const result = await response.json();
            console.log('Auth status check:', result);

            if (result.authenticated) {
                console.log('User is authenticated, redirecting to dashboard');
                
                // Store user in localStorage
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                
                window.location.href = 'dashboard.html';
            } else {
                console.log('User is not authenticated, staying on login page');
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
        }
    }

    showMessage(message, type = 'info') {
        console.log('Showing message:', message, type);
        // Remove any existing messages first
        this.hideMessage();
        
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        } else {
            // Fallback: create temporary message
            const tempMessage = document.createElement('div');
            tempMessage.className = `message ${type}`;
            tempMessage.textContent = message;
            tempMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 1rem; z-index: 1000;';
            
            if (type === 'success') {
                tempMessage.style.background = 'rgba(34, 197, 92, 0.1)';
                tempMessage.style.border = '1px solid rgba(34, 197, 92, 0.3)';
                tempMessage.style.color = '#93e9a9';
            } else if (type === 'error') {
                tempMessage.style.background = 'rgba(239, 68, 68, 0.1)';
                tempMessage.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                tempMessage.style.color = '#fca5a5';
            } else {
                tempMessage.style.background = 'rgba(59, 130, 246, 0.1)';
                tempMessage.style.border = '1px solid rgba(59, 130, 246, 0.3)';
                tempMessage.style.color = '#93c5fd';
            }
            
            document.body.appendChild(tempMessage);
            setTimeout(() => {
                if (tempMessage.parentNode) {
                    tempMessage.remove();
                }
            }, 5000);
        }
    }

    hideMessage() {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AuthManager...');
    new AuthManager();
});