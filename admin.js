// Sidebar toggle (mobile)
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Page switching
document.querySelectorAll('.sb-nav a').forEach(link => {
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    if (!page) return;

    // Update active sidebar
    document.querySelectorAll('.sb-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Close sidebar on mobile
    if (window.innerWidth < 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});

// "View All" link in dashboard
document.querySelectorAll('.link[data-page]').forEach(link => {
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    const sidebarLink = document.querySelector(`.sb-nav a[data-page="${page}"]`);
    if (sidebarLink) sidebarLink.click();
  });
});