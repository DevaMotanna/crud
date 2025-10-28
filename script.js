/* script.js
   Implements CRUD with localStorage for entries.
   - Entry object: { id, description, amount, type, date }
*/

(() => {
  // --- DOM references ---
  const entryForm = document.getElementById('entryForm');
  const descInput = document.getElementById('desc');
  const amountInput = document.getElementById('amount');
  const editIdInput = document.getElementById('editId');
  const entriesList = document.getElementById('entriesList');
  const emptyMsg = document.getElementById('emptyMsg');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const balanceEl = document.getElementById('balance');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  const LOCAL_KEY = 'income_expense_entries_v1';

  let entries = [];         // in-memory state
  let currentFilter = 'all'; // 'all' | 'income' | 'expense'

  // --- Initialization ---
  function init() {
    loadFromStorage();
    bindEvents();
    render();
  }

  // --- Storage ---
  function saveToStorage() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load entries from storage', e);
      entries = [];
    }
  }

  // --- CRUD operations ---
  function createEntry(desc, amount, type) {
    const entry = {
      id: cryptoRandomId(),
      description: desc.trim(),
      amount: Number(amount),
      type,
      date: new Date().toISOString()
    };
    entries.unshift(entry); // newest first
    saveToStorage();
    render();
  }

  function updateEntry(id, desc, amount, type) {
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return false;
    entries[idx].description = desc.trim();
    entries[idx].amount = Number(amount);
    entries[idx].type = type;
    // keep date as original (could add updatedAt if needed)
    saveToStorage();
    render();
    return true;
  }

  function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    saveToStorage();
    render();
  }

  // --- Utilities ---
  function cryptoRandomId() {
    // fallback if crypto not available
    try {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    }
  }

  function formatCurrency(n) {
    const isNegative = n < 0;
    const abs = Math.abs(Number(n) || 0);
    // Using toLocaleString for currency formatting; locale set to 'en-IN' for INR style.
    return (isNegative ? '-' : '') + '₹' + abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // --- Rendering ---
  function render() {
    renderSummary();
    renderList();
    resetFormState();
  }

  function renderSummary() {
    const incomeTotal = entries
      .filter(e => e.type === 'income')
      .reduce((s, e) => s + Number(e.amount), 0);

    const expenseTotal = entries
      .filter(e => e.type === 'expense')
      .reduce((s, e) => s + Number(e.amount), 0);

    const balance = incomeTotal - expenseTotal;

    totalIncomeEl.textContent = formatCurrency(incomeTotal);
    totalExpenseEl.textContent = formatCurrency(expenseTotal);
    balanceEl.textContent = formatCurrency(balance);
  }

  function renderList() {
    // filter entries according to currentFilter
    const filtered = entries.filter(e => {
      if (currentFilter === 'all') return true;
      return e.type === currentFilter;
    });

    entriesList.innerHTML = '';

    if (filtered.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    } else {
      emptyMsg.style.display = 'none';
    }

    // create DOM nodes
    for (const e of filtered) {
      const li = document.createElement('li');
      li.className = 'entry';

      const left = document.createElement('div');
      left.className = 'left';

      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.style.background = e.type === 'income' ? 'linear-gradient(180deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))' : 'linear-gradient(180deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))';
      left.appendChild(badge);

      const meta = document.createElement('div');
      meta.className = 'meta';
      const d = document.createElement('div');
      d.className = 'desc';
      d.textContent = e.description || (e.type === 'income' ? 'Income' : 'Expense');

      const s = document.createElement('div');
      s.className = 'small';
      const dt = new Date(e.date);
      s.textContent = dt.toLocaleString();

      meta.appendChild(d);
      meta.appendChild(s);

      left.appendChild(meta);

      const amount = document.createElement('div');
      amount.className = 'amount';
      amount.textContent = (e.type === 'expense' ? '-' : '') + formatCurrency(Math.abs(e.amount));

      const controls = document.createElement('div');
      controls.className = 'controls';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => startEdit(e.id));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => {
        if (confirm('Delete this entry?')) deleteEntry(e.id);
      });

      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(amount);
      li.appendChild(controls);

      entriesList.appendChild(li);
    }
  }

  // --- Form & Edit flow ---
  function startEdit(id) {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    editIdInput.value = e.id;
    descInput.value = e.description;
    amountInput.value = e.amount;
    document.getElementById(e.type === 'income' ? 'typeIncome' : 'typeExpense').checked = true;
    saveBtn.textContent = 'Update';
    saveBtn.classList.add('primary');
    // Autofocus on description for quick edits
    descInput.focus();
  }

  function resetFormState() {
    // if currently editing, keep the edit values. We only call this after render in neutral states.
    if (!editIdInput.value) {
      entryForm.reset(); // resets radio/inputs
      saveBtn.textContent = 'Add';
    } else {
      // keep the edit values visible (do nothing)
    }
  }

  // --- Event binding ---
  function bindEvents() {
    entryForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const desc = descInput.value;
      const amount = amountInput.value;
      const type = document.querySelector('input[name="type"]:checked').value;

      // validation
      if (!desc.trim()) {
        alert('Please enter a description.');
        descInput.focus();
        return;
      }
      const amtNum = Number(amount);
      if (!isFinite(amtNum) || amtNum <= 0) {
        alert('Please enter a valid amount greater than 0.');
        amountInput.focus();
        return;
      }

      const editingId = editIdInput.value;
      if (editingId) {
        const ok = updateEntry(editingId, desc, amtNum, type);
        if (ok) {
          editIdInput.value = ''; // clear edit mode
          saveBtn.textContent = 'Add';
        } else {
          alert('Could not update entry (not found).');
        }
      } else {
        createEntry(desc, amtNum, type);
      }
      // after submit, reset inputs (but keep form usability)
      entryForm.reset();
    });

    resetBtn.addEventListener('click', () => {
      // clear only the input fields, not saved data
      editIdInput.value = '';
      entryForm.reset();
      saveBtn.textContent = 'Add';
    });

    // filter radios
    const filterRadios = document.querySelectorAll('input[name="filter"]');
    filterRadios.forEach(r => r.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderList();
    }));

    // simple keyboard shortcut: esc to cancel edit
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        editIdInput.value = '';
        entryForm.reset();
        saveBtn.textContent = 'Add';
        renderList();
      }
    });
  }

  // --- Start app ---
  init();
})();
