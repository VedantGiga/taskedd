// This script runs before React loads to prevent theme flashing
(function() {
  try {
    // Try to get the theme from localStorage
    const storedTheme = localStorage.getItem('taskflow-theme');
    
    // Apply the theme immediately
    if (storedTheme === 'dark' || 
        (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    // Fallback if localStorage is not available
    console.error('Theme script error:', e);
  }
})();
