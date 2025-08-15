
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  }
  const btn = document.getElementById('themeToggle');
  if (btn) btn.onclick = () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  };

  const y = document.getElementById('year'), u = document.getElementById('lastUpdated');
  if (y) y.textContent = new Date().getFullYear();
  if (u) u.textContent = new Date().toISOString().slice(0,10);

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlink').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) a.classList.add('active');
  });

  const toTop = document.getElementById('toTop');
  if (toTop){
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) toTop.classList.add('show'); else toTop.classList.remove('show');
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  const openBtn = document.getElementById('openCmd');
  const items = [
    {label:'Home', href:'index.html'},
    {label:'About', href:'about.html'},
    {label:'Stanford Fit', href:'stanford-fit.html'},
    {label:'Research', href:'research.html'},
    {label:'Publications', href:'publications.html'},
    {label:'Teaching', href:'teaching.html'},
    {label:'Awards', href:'awards.html'},
    {label:'News', href:'news.html'},
    {label:'Contact', href:'contact.html'}
  ];

  function openPalette(){
    palette.classList.remove('hidden');
    input.value = '';
    render(items);
    setTimeout(() => input.focus(), 10);
  }
  function closePalette(){ palette.classList.add('hidden'); }
  function render(arr){
    list.innerHTML = arr.map(i => `<li class="item" data-href="${i.href}"><span>${i.label}</span><span class="text-xs text-slate-500">${i.href}</span></li>`).join('');
  }
  function filter(){
    const q = input.value.toLowerCase();
    render(items.filter(i => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q)));
  }

  if (palette && input && list){
    openBtn && (openBtn.onclick = openPalette);
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openPalette(); }
      if (e.key === 'Escape') closePalette();
    });
    palette.addEventListener('click', (e) => {
      if (e.target.matches('[data-cmd-close]')) closePalette();
      const li = e.target.closest('.item');
      if (li && li.dataset.href){ location.href = li.dataset.href; }
    });
    input.addEventListener('input', filter);
  }

  const pubList = document.getElementById('pubList');
  const pubCount = document.getElementById('pubCount');
  const pubYear = document.getElementById('pubYear');
  const pubQuery = document.getElementById('pubQuery');
  if (pubList){
    fetch('assets/pubs.json').then(r=>r.json()).then(data => {
      const years = Array.from(new Set(data.map(d => d.year))).sort((a,b)=>b-a);
      if (pubYear){
        pubYear.innerHTML = ['All', ...years].map(y => `<option value="${y}">${y}</option>`).join('');
      }
      function apply(){
        const y = pubYear ? pubYear.value : 'All';
        const q = (pubQuery ? pubQuery.value : '').toLowerCase();
        const filtered = data.filter(d =>
          (y === 'All' || String(d.year) == String(y)) &&
          (!q || (d.title + ' ' + d.venue + ' ' + (d.topics||[]).join(' ')).toLowerCase().includes(q))
        );
        pubList.innerHTML = filtered.map(d => `
          <li class="p-4 border rounded-xl bg-white dark:bg-slate-900">
            <div class="flex flex-wrap justify-between gap-2">
              <div>
                <div class="font-medium">${d.title}</div>
                <div class="text-slate-600 dark:text-slate-400">${d.venue} • ${d.year}</div>
                <div class="mt-1 flex flex-wrap gap-2">${(d.topics||[]).map(t=>`<span class="badge">${t}</span>`).join('')}</div>
              </div>
              <div class="flex items-center gap-2">
                ${d.doi ? `<a class="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-50 dark:hover:bg-slate-800" href="${d.doi}">DOI</a>` : ''}
              </div>
            </div>
          </li>`).join('');
        if (pubCount) pubCount.textContent = filtered.length;
      }
      pubYear && pubYear.addEventListener('change', apply);
      pubQuery && pubQuery.addEventListener('input', apply);
      apply();
    });
  }
})();