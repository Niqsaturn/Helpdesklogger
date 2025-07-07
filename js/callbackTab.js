window.callbackTabInit = function() {
  const callbacksFile = path.join(baseDir, "callbacks.json");
  function loadCallbacks(filter = null) {
    const container = document.getElementById('callbackList');
    container.innerHTML = '';
    if (!fs.existsSync(callbacksFile)) return container.innerHTML = '<div>No pending callbacks found.</div>';
    let callbacks = JSON.parse(fs.readFileSync(callbacksFile, 'utf8'));
    callbacks.forEach(cb => { if (!cb.assignedTo) cb.assignedTo = userName; });
    fs.writeFileSync(callbacksFile, JSON.stringify(callbacks, null, 2));
    const now = new Date();
    const range = { today: new Date().setHours(23,59,59,999), next7: new Date(Date.now()+7*86400000) };
    if (filter === 'today' || filter === 'next7') {
      callbacks = callbacks.filter(cb => {
        const cbDate = new Date(cb.date);
        return cbDate <= range[filter];
      });
    }
    callbacks = callbacks.filter(cb => cb.assignedTo === userName);
    if (!callbacks.length) return container.innerHTML = '<div>No pending callbacks.</div>';
    callbacks.sort((a, b) => new Date(a.date) - new Date(b.date));
    callbacks.forEach((cb, i) => {
      const card = document.createElement('div');
      card.className = 'ticket-card';
      card.innerHTML = `
        <strong>${cb.customer}</strong> (${cb.business})<br>
        <span class="meta">Model: ${cb.model} | Serial: ${cb.serial}</span><br>
        <span class="meta">📞 ${cb.phone} | 📧 ${cb.email}</span><br>
        <span class="meta">📅 ${cb.date}</span><br>
        <div class="actions">
          <button onclick="window.loadTab('viewerTab'); setTimeout(()=>window.loadTicketInViewer('${path.join(baseDir, cb.customer.replace(/[^a-z0-9]/gi, '_'), 'Tickets', cb.file).replace(/\\/g, '\\\\')}'), 100);">View</button>
          <button onclick="markCallbackDone(${i})">Mark Completed</button>
        </div>
      `;
      container.appendChild(card);
    });
  }
  window.markCallbackDone = function(index) {
    let callbacks = JSON.parse(fs.readFileSync(callbacksFile, 'utf8'));
    callbacks.splice(index, 1);
    fs.writeFileSync(callbacksFile, JSON.stringify(callbacks, null, 2));
    loadCallbacks();
  };
  document.getElementById('cbTodayBtn').onclick = () => loadCallbacks('today');
  document.getElementById('cbNext7Btn').onclick = () => loadCallbacks('next7');
  document.getElementById('cbAllBtn').onclick = () => loadCallbacks();
  document.getElementById('cbExportBtn').onclick = function() {
    if (!fs.existsSync(callbacksFile)) return alert('No callbacks to export.');
    const callbacks = JSON.parse(fs.readFileSync(callbacksFile, 'utf8'));
    if (!callbacks.length) return alert('No callbacks to export.');
    const csvLines = ["Ticket Number,Customer,Business,Phone,Email,Model,Serial,Date"];
    callbacks.forEach(cb => {
      csvLines.push([
        cb.ticketNumber, cb.customer, cb.business, cb.phone, cb.email, cb.model, cb.serial, cb.date
      ].map(f => `"${(f||'').replace(/"/g,'""')}"`).join(','));
    });
    const exportPath = path.join(baseDir, 'HelpdeskCallbacks', 'callbacks_export.csv');
    fs.writeFileSync(exportPath, csvLines.join('\n'));
    alert('✅ Callbacks exported to: ' + exportPath);
  };
  loadCallbacks();
};
