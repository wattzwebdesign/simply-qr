# Navigation Component Guide

## How to Add Consistent Navigation to New Pages

To add the header and mobile navigation to any new page, follow these steps:

### 1. Add Required HTML Structure

At the top of your `<body>` tag, add these placeholder divs:

```html
<body>
  <!-- Header will be loaded here -->
  <div id="header-placeholder"></div>

  <!-- Your page content here -->
  <div class="your-content">
    ...
  </div>

  <!-- Mobile nav will be loaded here -->
  <div id="mobile-nav-placeholder"></div>

  <!-- Scripts -->
  <script src="/js/nav.js"></script>
</body>
```

### 2. Add Required Meta Tags

Make sure your page has the proper viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### 3. Include Styles and Scripts

```html
<head>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Styles -->
  <link rel="stylesheet" href="/css/style.css?v=3">
</head>
<body>
  <!-- Your content -->

  <!-- Load nav.js BEFORE your page-specific scripts -->
  <script src="/js/nav.js"></script>
  <script src="/js/your-page.js"></script>
  <script>
    // Initialize Lucide icons
    lucide.createIcons();
  </script>
</body>
```

### 4. That's It!

The nav.js file will automatically:
- Load the header from `/includes/header.html`
- Load the mobile bottom nav from `/includes/mobile-nav.html`
- Initialize all event handlers
- Highlight the active page
- Set up profile dropdown and logout functionality

## Mobile Navigation

The mobile bottom navigation will automatically appear on screens **768px and below**. It includes:
- Dashboard link
- Analytics link
- Active state highlighting

## Future Updates

To update navigation across all pages:
1. Edit `/public/includes/header.html` for header changes
2. Edit `/public/includes/mobile-nav.html` for mobile nav changes
3. Changes will apply to all pages automatically

## Customizing Per Page

If you need page-specific buttons in the header (like "Export CSV" on analytics pages), add them directly in your HTML after the `header-placeholder` div loads, or add conditional logic in the nav.js file.
