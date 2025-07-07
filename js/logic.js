const fs = require('fs');
const path = require('path');
const os = require('os');
const baseDir = "M:/HelpdeskLogger";
const userName = os.userInfo().username;
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('loggedUser').textContent = userName;
  renderTabBar();
  loadTab('callTab'); // Default tab on load
});

function renderTabBar() {
  const tabs = [
    { id: "callTab", icon: "📞", label: "Call Logging" },
    { id: "resTab", icon: "🧠", label: "Known Resolutions" },
    { id: "callbackTab", icon: "📅", label: "Callbacks" },
    { id: "searchTab", icon: "🔍", label: "Search Tickets" },
    { id: "myTicketsTab", icon: "👤", label: "My Tickets" },
    { id: "viewerTab", icon: "🗂️", label: "Ticket Viewer", hidden: true }
  ];
  const tabBar = document.getElementById('tabBar');
  tabBar.innerHTML = '';
  tabs.forEach(tab => {
    if (tab.hidden) return;
    const btn = document.createElement('button');
    btn.textContent = `${tab.icon} ${tab.label}`;
    btn.className = "tab-button";
    btn.onclick = () => loadTab(tab.id);
    btn.id = tab.id + "Btn";
    tabBar.appendChild(btn);
  });
}

function loadTab(tabName) {
  const tabFiles = {
    callTab: 'html/callTab.html',
    resTab: 'html/resTab.html',
    callbackTab: 'html/callbackTab.html',
    searchTab: 'html/searchTab.html',
    myTicketsTab: 'html/myTicketsTab.html',
    viewerTab: 'html/viewerTab.html'
  };
  fs.readFile(tabFiles[tabName], 'utf8', (err, data) => {
    document.getElementById('mainContent').innerHTML = err ? `<div>Error loading tab: ${tabName}</div>` : data;
    // Dynamically load tab JS
    if (window.currentTabScript) { document.body.removeChild(window.currentTabScript); }
    let script = document.createElement('script');
    script.src = `js/${tabName}.js`;
    script.onload = () => { if (window[tabName + 'Init']) window[tabName + 'Init'](); };
    document.body.appendChild(script);
    window.currentTabScript = script;
  });
}

// Utility for showing Ticket Viewer tab only when needed:
function showViewerTab(show = true) {
  const viewerBtn = document.getElementById('viewerTabBtn');
  if (viewerBtn) viewerBtn.style.display = show ? '' : 'none';
}

// Export this function for use in all tabs:
window.loadTab = loadTab;
window.showViewerTab = showViewerTab;
window.userName = userName;
window.baseDir = baseDir;
window.fs = fs;
window.path = path;
