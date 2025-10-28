# Income & Expense Calculator

A lightweight, responsive Income & Expense calculator built with plain HTML, CSS, and JavaScript.

## Features
- Add income and expense entries (description, amount, type).
- Edit and delete existing entries.
- Filter entries by `All`, `Income`, or `Expense` using radio buttons.
- Summary at the top: Total Income, Total Expense, Net Balance.
- Data persisted in Local Storage (`income_expense_entries_v1`) so it remains across sessions.
- Responsive layout for desktop and mobile.
- Reset button to clear the form input fields.
- Keyboard: press `Esc` to cancel editing.

## Files
- `index.html` — Markup and structure.
- `styles.css` — Styling and responsive layout.
- `script.js` — All JavaScript logic (CRUD + local storage).

## How to run
1. Download or clone the files.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. Start adding entries!

## Notes & Implementation details
- Entries are stored as objects: `{ id, description, amount, type, date }`.
- The app keeps newest entries at the top of the list.
- Amounts must be positive numbers; expenses are shown with a minus sign in the UI.
- The app uses `toLocaleString('en-IN')` formatting for currency display (₹).
- No external libraries required.

## Extending / Ideas
- Add categories for expenses.
- Add charts to visualize spending.
- Allow CSV export / import.
- Add monthly/yearly filtering.

---

If you want, I can:
- Add export/import (CSV) functionality,
- Add a confirmation snackbar/undo after delete,
- Or convert this to a single-file app or a React component.

Tell me which enhanceme
