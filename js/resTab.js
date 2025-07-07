window.resTabInit = function() {
  const resFile = path.join(baseDir, "resolutions.json");
  function loadResolutions() {
    const list = document.getElementById('resolutionList');
    list.innerHTML = '';
    if (!fs.existsSync(resFile)) return;
    const resolutions = JSON.parse(fs.readFileSync(resFile, 'utf8'));
    resolutions.forEach(res => {
      const li = document.createElement('li');
      li.textContent = res.title;
      li.onclick = () => {
        if (confirm('Insert this resolution into a ticket?')) {
          window.loadTab('callTab');
          setTimeout(() => {
            const field = document.getElementById('troubleshootingSteps');
            field.value += (field.value ? "\n" : "") + res.text;
          }, 300);
        }
      };
      list.appendChild(li);
    });
    // Populate dropdown in CallTab
    if (window.loadTab) window.loadTab('callTab');
  }
  document.getElementById('saveResolutionBtn').onclick = function() {
    const title = document.getElementById('resolutionTitle').value.trim();
    const text = document.getElementById('resolutionText').value.trim();
    if (!title || !text) return alert("Please complete all fields.");
    let resolutions = [];
    if (fs.existsSync(resFile)) {
      try { resolutions = JSON.parse(fs.readFileSync(resFile, 'utf8')); } catch {}
    }
    resolutions.push({ title, text });
    fs.writeFileSync(resFile, JSON.stringify(resolutions, null, 2));
    document.getElementById('resolutionTitle').value = '';
    document.getElementById('resolutionText').value = '';
    loadResolutions();
  };
  loadResolutions();
};
