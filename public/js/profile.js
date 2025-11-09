// Profile page functionality

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = '/login';
}

// Elements
const profileForm = document.getElementById('profile-form');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const emailInput = document.getElementById('email');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const saveBtn = document.getElementById('save-btn');
const alertContainer = document.getElementById('alert-container');

// Show alert
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);

  // Scroll to top to show alert
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load user profile
async function loadProfile() {
  try {
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    const data = await response.json();

    if (data.success) {
      firstNameInput.value = data.user.firstName || '';
      lastNameInput.value = data.user.lastName || '';
      emailInput.value = data.user.email || '';
    } else {
      showAlert('Failed to load profile', 'error');
    }
  } catch (error) {
    console.error('Load profile error:', error);
    showAlert('Network error. Please refresh.', 'error');
  }
}

// Handle form submission
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate email
  if (!email) {
    showAlert('Email is required', 'error');
    return;
  }

  // Validate password change
  if (newPassword || confirmPassword || currentPassword) {
    if (!currentPassword) {
      showAlert('Current password is required to change password', 'error');
      return;
    }

    if (!newPassword) {
      showAlert('New password is required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('New password must be at least 6 characters', 'error');
      return;
    }
  }

  // Disable button
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<div class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></div> Saving...';

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));

      showAlert('Profile updated successfully!', 'success');

      // Clear password fields
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';

      // If email changed, might want to re-login
      if (email !== user.email) {
        setTimeout(() => {
          showAlert('Email updated. Please log in again.', 'info');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        }, 1000);
      }
    } else {
      showAlert(data.error || 'Failed to update profile', 'error');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    showAlert('Network error. Please try again.', 'error');
  } finally {
    // Re-enable button
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="save" style="width: 18px; height: 18px;"></i> Save Changes';
    lucide.createIcons();
  }
});

// Load profile on page load
loadProfile();
