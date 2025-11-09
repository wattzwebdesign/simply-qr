// Global Navigation Component
// This file handles the consistent navigation header across all pages

function initializeNavigation() {
  // Get user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Update profile email if element exists
  const profileEmailEl = document.getElementById('profile-email');
  if (profileEmailEl) {
    profileEmailEl.textContent = user.email || '';
  }

  // Profile dropdown functionality
  const profileButton = document.getElementById('profile-button');
  const profileMenu = document.getElementById('profile-menu');
  const logoutMenuBtn = document.getElementById('logout-menu-btn');

  if (profileButton && profileMenu) {
    // Profile dropdown toggle
    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('open');
    });

    // Close profile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('open');
      }
    });
  }

  // Logout handler
  if (logoutMenuBtn) {
    logoutMenuBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
  }

  // Highlight current page in navigation
  highlightCurrentPage();
}

function highlightCurrentPage() {
  const currentPath = window.location.pathname;

  // Get all navigation links (desktop)
  const navLinks = document.querySelectorAll('.dashboard-header a.btn');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');

    // Remove any existing active class
    link.classList.remove('btn-active');

    // Add active class to current page
    if (href === currentPath ||
        (href === '/dashboard' && currentPath === '/') ||
        (href === '/analytics' && currentPath.startsWith('/analytics')) ||
        (href === '/qr-analytics' && currentPath.startsWith('/qr-analytics'))) {
      // For secondary buttons, we'll change them to show they're active
      if (link.classList.contains('btn-secondary')) {
        link.style.background = 'var(--primary-emerald)';
        link.style.color = 'white';
        link.style.borderColor = 'var(--primary-emerald)';
      }
    }
  });

  // Highlight mobile bottom nav items
  const mobileBottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
  mobileBottomNavItems.forEach(link => {
    const href = link.getAttribute('href');

    // Remove existing active class
    link.classList.remove('active');

    // Add active class to current page
    if (href === currentPath ||
        (href === '/dashboard' && currentPath === '/') ||
        (href === '/analytics' && currentPath.startsWith('/analytics')) ||
        (href === '/qr-analytics' && currentPath.startsWith('/qr-analytics'))) {
      link.classList.add('active');
    }
  });
}

// Initialize navigation immediately
initializeNavigation();
