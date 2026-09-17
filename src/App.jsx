import { useMemo, useState } from 'react'
import './App.css'

const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
]

const STORAGE_KEY = 'expense-tracker-demo'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function App() {
  const [expenses, setExpenses] = useState(loadExpenses)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState(todayISO)

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  )

  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [expenses],
  )

  function persist(next) {
    setExpenses(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0 || !date) return

    persist([
      ...expenses,
      {
        id: Date.now(),
        amount: Math.round(parsed * 100) / 100,
        category,
        date,
      },
    ])
    setAmount('')
    setCategory(CATEGORIES[0])
    setDate(todayISO())
  }

  return (
    <main className="app">
      <header className="masthead">
        <div>
          <p className="eyebrow">Personal ledger</p>
          <h1>Expenses</h1>
        </div>
        <p className="date-stamp">{formatDate(todayISO())}</p>
      </header>

      <section className="total-card" aria-live="polite">
        <p className="label">Running total</p>
        <p className="amount">{formatMoney(total)}</p>
        <p className="meta">
          {expenses.length === 0
            ? 'No expenses yet'
            : `${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'}`}
        </p>
      </section>

      <section className="panel">
        <h2>Add expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="fields">
            <label>
              Amount
              <input
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
          </div>
          <button className="submit" type="submit">
            Add expense
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>All expenses</h2>
        {sorted.length === 0 ? (
          <p className="empty">Add an amount, category, and date to start the list.</p>
        ) : (
          <ul className="list">
            {sorted.map((expense) => (
              <li key={expense.id}>
                <span className="category">{expense.category}</span>
                <span className="spend">{formatMoney(expense.amount)}</span>
                <span className="when">{formatDate(expense.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
