window.searchTabInit = function() {
  document.getElementById('searchBtn').onclick = runAdvancedSearch;
  document.getElementById('searchBox').addEventListener('keyup', function(e) { if (e.key === "Enter") runAdvancedSearch(); });
  function runAdvancedSearch() {
    const term = document.getElementById('searchBox').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    if (!term) return resultsDiv.innerHTML = '<p>Enter a search term.</p>';
    const matches = [];
    fs.readdirSync(baseDir).forEach(customer => {
      const customerPath = path.join(baseDir, customer, 'Tickets');
      if (!fs.existsSync(customerPath)) return;
      fs.readdirSync(customerPath).forEach(file => {
        const content = fs.readFileSync(path.join(customerPath, file), 'utf8').toLowerCase();
        if (content.includes(term)) {
          matches.push({ file, customer, content });
        }
      });
    });
    if (!matches.length) return resultsDiv.innerHTML = '<p>No matching tickets found.</p>';
    matches.forEach(match => {
      const card = document.createElement('div');
      card.className = 'ticket-card';
      card.innerHTML = `<strong>${match.customer}</strong><br><code>${match.file}</code><br><pre>${match.content.substring(0, 200)}...</pre>`;
      card.onclick = () => {
        window.loadTab('viewerTab');
        setTimeout(() => window.loadTicketInViewer(path.join(baseDir, match.customer, 'Tickets', match.file)), 100);
      };
      resultsDiv.appendChild(card);
    });
  }
};
