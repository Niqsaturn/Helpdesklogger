window.callTabInit = function() {
  // Ticket Number on Name Blur
  document.getElementById('customerName').addEventListener('blur', updateTicketNumber);

  function updateTicketNumber() {
    const name = document.getElementById('customerName').value.trim();
    if (!name) { document.getElementById('ticketNumber').value = ""; return; }
    const customerFolder = path.join(baseDir, name.replace(/[^a-z0-9]/gi, '_'));
    const ticketDir = path.join(customerFolder, 'Tickets');
    if (!fs.existsSync(ticketDir)) return document.getElementById('ticketNumber').value = 1;
    let nums = fs.readdirSync(ticketDir)
      .map(f => parseInt((f.match(/\d+/) || [0])[0]))
      .filter(n => !isNaN(n));
    document.getElementById('ticketNumber').value = nums.length ? Math.max(...nums) + 1 : 1;
  }

  // Save Ticket
  document.getElementById('saveTicketBtn').onclick = function() {
    const fields = {
      "Customer Type": document.getElementById('customerType').value,
      "Customer Name": document.getElementById('customerName').value,
      "Business Name": document.getElementById('businessName').value,
      "Zip Code": document.getElementById('zipCode').value,
      "Email": document.getElementById('email').value,
      "Phone Number": document.getElementById('phoneNumber').value,
      "Model Number": document.getElementById('modelNumber').value,
      "Serial Number": document.getElementById('serialNumber').value,
      "Reason for Calling": document.getElementById('reason').value,
      "Troubleshooting": document.getElementById('troubleshootingSteps').value,
      "Callback Date/Time": document.getElementById('callbackDate').value,
      "Status": document.getElementById('ticketStatus').value,
      "Priority": document.getElementById('priority').value,
      "Category": document.getElementById('category').value,
      "Tags": document.getElementById('tags').value,
      "Internal Notes": document.getElementById('internalNotes').value,
      "Ticket Number": document.getElementById('ticketNumber').value,
      "Assigned Agent": userName
    };
    if (!fields["Customer Name"] || !fields["Phone Number"]) return alert("Name and phone are required.");
    checkDuplicateCustomer(fields["Customer Name"], (exists) => {
      const customerDir = path.join(baseDir, fields["Customer Name"].replace(/[^a-z0-9]/gi, '_'));
      const ticketDir = path.join(customerDir, 'Tickets');
      if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir, { recursive: true });
      let fileName = `Ticket_${fields["Ticket Number"]}.txt`;
      let fullPath = path.join(ticketDir, fileName);
      // If file exists, mark as revision (RV)
      if (fs.existsSync(fullPath)) {
        fileName = `Ticket_${fields["Ticket Number"]}_RV.txt`;
        fullPath = path.join(ticketDir, fileName);
      }
      const content = Object.entries(fields).map(([k,v]) => `${k}: ${v}`).join('\n');
      fs.writeFileSync(fullPath, content);
      if (fields["Callback Date/Time"]) saveCallback(fields, fileName);
      alert("✅ Ticket Saved!");
      document.querySelectorAll('#mainContent input:not([readonly]), #mainContent textarea').forEach(el => el.value = '');
      document.getElementById('ticketNumber').value = '';
      window.loadTab('myTicketsTab');
      window.loadTab('callbackTab');
      window.loadTab('searchTab');
    });
  };

  // Resolutions dropdown
  loadResolutions();

  // Resolution insert
  window.insertSelectedResolution = function() {
    const dropdown = document.getElementById('resolutionDropdown');
    const selected = dropdown.value;
    if (!selected) return alert("Choose a resolution.");
    if (!fs.existsSync(path.join(baseDir, "resolutions.json"))) return;
    const resolutions = JSON.parse(fs.readFileSync(path.join(baseDir, "resolutions.json"), 'utf8'));
    const res = resolutions.find(r => r.title === selected);
    if (res) {
      const field = document.getElementById('troubleshootingSteps');
      field.value += (field.value ? "\n" : "") + res.text;
    }
  };

  // Autofill duplicate
  function checkDuplicateCustomer(name, callback) {
    const folder = path.join(baseDir, name.replace(/[^a-z0-9]/gi, '_'));
    if (!fs.existsSync(folder)) return callback(false);
    const ticketDir = path.join(folder, 'Tickets');
    if (!fs.existsSync(ticketDir)) return callback(false);
    const files = fs.readdirSync(ticketDir);
    if (!files.length) return callback(false);
    const lastTicket = fs.readFileSync(path.join(ticketDir, files[files.length-1]), 'utf8');
    const fields = {};
    lastTicket.split('\n').forEach(line => {
      const [k, ...v] = line.split(':');
      fields[k.trim()] = v.join(':').trim();
    });
    if (confirm(`A customer named "${name}" already exists. Autofill details?`)) {
      document.getElementById('businessName').value = fields["Business Name"] || '';
      document.getElementById('zipCode').value = fields["Zip Code"] || '';
      document.getElementById('email').value = fields["Email"] || '';
      document.getElementById('phoneNumber').value = fields["Phone Number"] || '';
      document.getElementById('modelNumber').value = fields["Model Number"] || '';
      document.getElementById('serialNumber').value = fields["Serial Number"] || '';
    }
    callback(true);
  }

  // Resolutions load
  function loadResolutions() {
    const dd = document.getElementById('resolutionDropdown');
    dd.innerHTML = '<option value="">--Insert Resolution--</option>';
    if (!fs.existsSync(path.join(baseDir, "resolutions.json"))) return;
    const resolutions = JSON.parse(fs.readFileSync(path.join(baseDir, "resolutions.json"), 'utf8'));
    resolutions.forEach(res => {
      const opt = document.createElement('option');
      opt.value = res.title;
      opt.textContent = res.title;
      dd.appendChild(opt);
    });
  }
};
