window.viewerTabInit = function() {
  window.loadTicketInViewer = function(filePath) {
    const container = document.getElementById('ticketViewerContent');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const map = {};
    lines.forEach(line => {
      const [key, ...value] = line.split(':');
      map[key.trim()] = value.join(':').trim();
    });
    let html = `<h2>Ticket Viewer</h2>`;
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 30px;">`;
    Object.entries(map).forEach(([key, val]) => {
      html += `<div><label>${key}</label><input type="text" value="${val}" readonly class="readonly"/></div>`;
    });
    html += `</div><br><button id="editTicketBtn">Edit</button>`;
    container.innerHTML = html;
    document.getElementById('editTicketBtn').onclick = function() {
      const inputs = container.querySelectorAll('input');
      inputs.forEach(input => input.removeAttribute('readonly'));
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save Revision';
      saveBtn.onclick = function() {
        const fields = {};
        container.querySelectorAll('label').forEach((label, i) => {
          fields[label.textContent] = inputs[i].value;
        });
        // Save as RV revision
        let revisedPath = filePath.replace(/\.txt$/, '_RV.txt');
        const content = Object.entries(fields).map(([k,v]) => `${k}: ${v}`).join('\n');
        fs.writeFileSync(revisedPath, content);
        alert("Ticket revised and saved as RV.");
        window.loadTicketInViewer(revisedPath);
      };
      container.appendChild(saveBtn);
    };
  };
};
