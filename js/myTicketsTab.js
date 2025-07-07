window.myTicketsTabInit = function() {
  const myContainer = document.getElementById('myTicketsContainer');
  myContainer.innerHTML = '';
  const statuses = ['Open', 'Pending', 'Closed'];
  const tickets = [];
  fs.readdirSync(baseDir).forEach(customer => {
    const dir = path.join(baseDir, customer, 'Tickets');
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
      const full = path.join(dir, file);
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      const data = {};
      lines.forEach(l => {
        const [k, ...v] = l.split(':');
        data[k.trim()] = v.join(':').trim();
      });
      if (data["Assigned Agent"] === userName) tickets.push({ ...data, file, path: full });
    });
  });
  statuses.forEach(status => {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${status} Tickets</h3>`;
    const matches = tickets.filter(t => t["Status"] === status);
    if (!matches.length) {
      section.innerHTML += `<p>No ${status} tickets.</p>`;
    } else {
      matches.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `<strong>${ticket["Customer Name"]}</strong> - ${ticket["Ticket Number"]}<br>
          <span>${ticket["Reason for Calling"]}</span><br>
          <small>Status: ${ticket["Status"]} | Priority: ${ticket["Priority"]}</small>`;
        card.onclick = () => {
          window.loadTab('viewerTab');
          setTimeout(() => window.loadTicketInViewer(ticket.path), 100);
        };
        section.appendChild(card);
      });
    }
    myContainer.appendChild(section);
  });
};
