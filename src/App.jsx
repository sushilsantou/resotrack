import { useState, useEffect, useRef, useCallback } from "react";

const MODES = {
  work: { label: "Focus", duration: 25 * 60, color: "#e85d4a" },
  short: { label: "Short Break", duration: 5 * 60, color: "#4a9e8e" },
  long: { label: "Long Break", duration: 15 * 60, color: "#4a6ee8" },
};

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,700;1,9..144,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0e0d;
    --surface: #1a1917;
    --border: #2e2c29;
    --muted: #5a5752;
    --text: #e8e4de;
    --accent: #e85d4a;
    --radius: 12px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
  }

  .app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    min-height: 100vh;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* LEFT - TIMER */
  .timer-panel {
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .timer-panel::before {
    content: '';
    position: absolute;
    top: -120px;
    left: -120px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--accent-glow, rgba(232,93,74,0.06)) 0%, transparent 70%);
    pointer-events: none;
    transition: background 1s ease;
  }

  .app-title {
    font-family: 'Fraunces', serif;
    font-size: 13px;
    font-weight: 200;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 60px;
  }

  .mode-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 50px;
  }

  .mode-tab {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    padding: 7px 14px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-tab:hover { color: var(--text); border-color: var(--border); }
  .mode-tab.active {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
  }

  .timer-display {
    font-family: 'Fraunces', serif;
    font-size: clamp(72px, 10vw, 110px);
    font-weight: 700;
    letter-spacing: -4px;
    line-height: 1;
    margin-bottom: 12px;
    transition: color 0.5s ease;
  }

  .mode-label {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 50px;
  }

  .progress-bar {
    width: 100%;
    height: 2px;
    background: var(--border);
    border-radius: 2px;
    margin-bottom: 50px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1s linear, background 0.5s ease;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .btn-primary {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    padding: 14px 40px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    font-weight: 500;
  }

  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 14px 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-ghost:hover { color: var(--text); border-color: var(--muted); }

  .session-count {
    margin-top: auto;
    padding-top: 40px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  .session-dots {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.3s;
  }

  .dot.filled { background: var(--accent); }

  /* RIGHT - TASKS */
  .tasks-panel {
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
  }

  .tasks-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .tasks-title {
    font-family: 'Fraunces', serif;
    font-size: 24px;
    font-weight: 200;
    font-style: italic;
  }

  .tasks-count {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  .task-input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
  }

  .task-input {
    flex: 1;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
  }

  .task-input::placeholder { color: var(--muted); }
  .task-input:focus { border-color: var(--muted); }

  .btn-add {
    font-family: 'DM Mono', monospace;
    font-size: 18px;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .btn-add:hover { background: var(--border); }

  .task-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .task-list::-webkit-scrollbar { width: 4px; }
  .task-list::-webkit-scrollbar-track { background: transparent; }
  .task-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.2s;
    animation: slideIn 0.2s ease;
    cursor: pointer;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .task-item:hover { border-color: var(--muted); }
  .task-item.active-task { border-color: var(--accent); }
  .task-item.done { opacity: 0.45; }

  .task-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 10px;
  }

  .task-check:hover { border-color: var(--accent); }
  .task-check.checked { background: var(--accent); border-color: var(--accent); color: white; }

  .task-text {
    flex: 1;
    font-size: 13px;
    line-height: 1.4;
    word-break: break-word;
  }

  .task-item.done .task-text {
    text-decoration: line-through;
  }

  .task-del {
    font-size: 16px;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .task-item:hover .task-del { opacity: 1; }
  .task-del:hover { color: var(--text); }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .empty-state div:first-child {
    font-family: 'Fraunces', serif;
    font-size: 36px;
    font-style: italic;
    font-weight: 200;
    margin-bottom: 8px;
    color: var(--border);
  }

  @media (max-width: 700px) {
    .app { grid-template-columns: 1fr; }
    .timer-panel { border-right: none; border-bottom: 1px solid var(--border); padding: 40px 28px; }
    .tasks-panel { padding: 40px 28px; }
    .timer-display { font-size: 80px; }
  }
`;

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function App() {
  const [mode, setMode] = useState("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const intervalRef = useRef(null);
  const total = MODES[mode].duration;
  const color = MODES[mode].color;

  useEffect(() => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessions(s => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const reset = () => { setRunning(false); setTimeLeft(MODES[mode].duration); };

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks(t => [...t, { id: Date.now(), text, done: false }]);
    setInput("");
  };

  const toggleTask = (id) => setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task));
  const deleteTask = (id) => { setTasks(t => t.filter(task => task.id !== id)); if (activeTaskId === id) setActiveTaskId(null); };

  const progress = ((total - timeLeft) / total) * 100;
  const remaining = tasks.filter(t => !t.done).length;

  return (
    <>
      <style>{style}</style>
      <div className="app">
        {/* TIMER */}
        <div className="timer-panel" style={{"--accent": color, "--accent-glow": `${color}10`}}>
          <div className="app-title">Pomodoro</div>

          <div className="mode-tabs">
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                className={`mode-tab${mode === key ? " active" : ""}`}
                onClick={() => setMode(key)}
              >{val.label}</button>
            ))}
          </div>

          <div className="timer-display" style={{ color }}>{fmt(timeLeft)}</div>
          <div className="mode-label">{MODES[mode].label}</div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
          </div>

          <div className="controls">
            <button
              className="btn-primary"
              style={{ background: color, color: "#fff" }}
              onClick={() => setRunning(r => !r)}
            >
              {running ? "pause" : "start"}
            </button>
            <button className="btn-ghost" onClick={reset}>reset</button>
          </div>

          <div className="session-count">
            <div>sessions completed</div>
            <div className="session-dots">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`dot${i < sessions % 4 || (sessions > 0 && sessions % 4 === 0 && i < 4) ? " filled" : ""}`} />
              ))}
            </div>
            <div style={{marginTop: 6}}>{sessions} total</div>
          </div>
        </div>

        {/* TASKS */}
        <div className="tasks-panel">
          <div className="tasks-header">
            <div className="tasks-title">tasks</div>
            <div className="tasks-count">{remaining} remaining</div>
          </div>

          <div className="task-input-row">
            <input
              className="task-input"
              placeholder="add a task..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
            />
            <button className="btn-add" onClick={addTask}>+</button>
          </div>

          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div>✦</div>
                <div>nothing yet</div>
              </div>
            ) : tasks.map(task => (
              <div
                key={task.id}
                className={`task-item${task.done ? " done" : ""}${activeTaskId === task.id ? " active-task" : ""}`}
                onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
              >
                <div
                  className={`task-check${task.done ? " checked" : ""}`}
                  onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                >
                  {task.done && "✓"}
                </div>
                <div className="task-text">{task.text}</div>
                <button className="task-del" onClick={e => { e.stopPropagation(); deleteTask(task.id); }}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
