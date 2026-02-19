import { useState, useEffect, useRef, useCallback } from "react";
import './index.css'

const MODES = {
  work: { label: "Focus", duration: 25 * 60, color: "#e85d4a" },
  short: { label: "Short Break", duration: 5 * 60, color: "#4a9e8e" },
  long: { label: "Long Break", duration: 15 * 60, color: "#4a6ee8" },
};

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
      <div className="app">
        {/* TIMER */}
        <div className="timer-panel" style={{"--accent": color, "--accent-glow": `${color}10`}}>
          <div className="app-title">Resotrack</div>

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
