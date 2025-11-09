// Authentication handling

// Check if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard';
}

// Form elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleFormLink = document.getElementById('toggle-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleText = document.getElementById('toggle-text');
const alertContainer = document.getElementById('alert-container');

let isLoginMode = true;

// Toggle between login and register
toggleFormLink.addEventListener('click', (e) => {
  e.preventDefault();

  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    // Show login form
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Sign in to manage your QR codes';
    toggleText.textContent = "Don't have an account?";
    toggleFormLink.textContent = 'Sign Up';
  } else {
    // Show register form
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Get started with QR Code Manager';
    toggleText.textContent = 'Already have an account?';
    toggleFormLink.textContent = 'Sign In';
  }

  // Clear alerts
  alertContainer.innerHTML = '';
});

// Show alert message
function showAlert(message, type = 'error') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('login-btn');

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> <span>Signing in...</span>';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show success and redirect
      showAlert('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      showAlert(data.error || 'Login failed');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In</span>';
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Network error. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Sign In</span>';
  }
});

// Register handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-password-confirm').value;
  const submitBtn = document.getElementById('register-btn');

  // Validate passwords match
  if (password !== confirmPassword) {
    showAlert('Passwords do not match');
    return;
  }

  // Validate password length
  if (password.length < 8) {
    showAlert('Password must be at least 8 characters long');
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> <span>Creating account...</span>';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Show success and redirect
      showAlert('Account created successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      showAlert(data.error || 'Registration failed');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Create Account</span>';
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('Network error. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Create Account</span>';
  }
});
