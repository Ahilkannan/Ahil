import React, { useEffect, useRef, useState } from 'react';

const KEY = 'ahil-planner-v1';
function loadTasks() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return { tasks: [], notice: '', raw };
    const tasks = JSON.parse(raw);
    const ids = new Set();
    if (!Array.isArray(tasks) || tasks.some(t => {
      if (!t || typeof t.id !== 'string' || ids.has(t.id) || typeof t.title !== 'string' || !t.title.trim() || typeof t.completed !== 'boolean' || typeof t.priority !== 'boolean' || typeof t.due !== 'string' || (t.due && !/^\d{4}-\d{2}-\d{2}$/.test(t.due))) return true;
      ids.add(t.id); return false;
    })) throw new Error('Invalid saved tasks');
    let priorities = 0;
    return {tasks: tasks.map(t => ({...t, priority: !t.completed && t.priority && ++priorities <= 3})), notice:'', raw};
  } catch {
    return {tasks:[], raw, notice:'Saved tasks could not be read. Adding a task starts a new list and preserves a recovery copy.'};
  }
}
function displayDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
}
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function App() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState(initial.tasks);
  const [notice] = useState(initial.notice);
  const [saveError, setSaveError] = useState(false);
  const [conflict, setConflict] = useState(false);
  const lastSaved = useRef(initial.raw);
  const backedUp = useRef(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [view, setView] = useState('active');
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDue, setEditDue] = useState('');
  useEffect(() => {
    if (initial.notice && tasks === initial.tasks) return;
    try {
      if (localStorage.getItem(KEY) !== lastSaved.current) { setConflict(true); return; }
      if (initial.notice && initial.raw && !backedUp.current) {
        localStorage.setItem(`${KEY}-recovery`, initial.raw);
        backedUp.current = true;
      }
      const serialized = JSON.stringify(tasks);
      localStorage.setItem(KEY, serialized);
      lastSaved.current = serialized;
      setSaveError(false);
    }
    catch { setSaveError(true); }
  }, [tasks, initial]);
  useEffect(() => {
    const onStorage = event => {
      if ((event.key === KEY || event.key === null) && event.newValue !== lastSaved.current) setConflict(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const active = tasks.filter(t => !t.completed);
  const completed = tasks.length - active.length;
  const priorities = active.filter(t => t.priority);
  const shown = tasks.filter(t => view === 'completed' ? t.completed : !t.completed);
  const update = (id, change) => setTasks(current => current.map(t => t.id === id ? {...t, ...change} : t));
  function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setTasks(current => [...current, {id:crypto.randomUUID(), title:title.trim(), due, completed:false, priority:false}]);
    setTitle(''); setDue(''); setView('active');
  }
  function saveEdit(event) {
    event.preventDefault();
    if (!editTitle.trim()) return;
    update(editing, {title:editTitle.trim(), due:editDue}); setEditing(null);
  }
  return <div className="app-shell">
    <header className="topbar"><a href="#" className="brand"><span className="brand-mark">a<span>↗</span></span> ahil<span className="brand-light">/ planner</span></a><span className="local-badge"><span/> Your space, your pace</span></header>
    <main>
      <section className="intro"><div><p className="eyebrow">A LITTLE INTENTION GOES A LONG WAY</p><h1>Make room for<br/><em>what matters.</em></h1><p className="intro-copy">Get it out of your head. Give your day a little direction.</p></div><div className="date-card"><span>TODAY</span><strong>{new Date().toLocaleDateString(undefined,{weekday:'long'})}</strong><span>{new Date().toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}</span><div className="date-line"/><p>One thing at a time.<br/>You’ve got this.</p></div></section>
      {notice && <p className="notice" role="status">{notice}</p>}
      {conflict && <p className="notice" role="alert">Tasks changed in another tab. Changes here are not saved. Copy any new tasks, then reload this page to use the latest list.</p>}
      {saveError && <p className="notice" role="alert">Your browser cannot save tasks right now. Keep this page open to retain your current list.</p>}
      <section className="focus-panel" aria-labelledby="focus-heading"><div className="section-heading"><div><p className="eyebrow">LESS, BUT BETTER</p><h2 id="focus-heading">Today’s focus <span className="count">{priorities.length}/3</span></h2></div><span className="focus-hint">Your three most important things</span></div><div className="focus-grid">{Array.from({length:3},(_,i) => <div className={`focus-slot ${priorities[i] ? 'filled' : ''}`} key={i}><span className="slot-number">0{i+1}</span>{priorities[i] ? <span className="focus-title">{priorities[i].title}</span> : <span>Make space for a priority</span>}<span className="slot-star" aria-hidden="true">✧</span></div>)}</div><p className="focus-note">Choose the star beside a task to bring it into focus.</p></section>
      <section className="task-section" aria-labelledby="tasks-heading"><div className="section-heading"><div><p className="eyebrow">SMALL STEPS, REAL PROGRESS</p><h2 id="tasks-heading">Your tasks</h2></div><span className="task-summary">{active.length} to do · {completed} done</span></div>
        <form className="add-form" onSubmit={addTask}><div className="task-input-wrap"><span aria-hidden="true">＋</span><input aria-label="Task name" placeholder="What would you like to get done?" value={title} onChange={e=>setTitle(e.target.value)} maxLength={300} required/></div><label className="date-input"><span>Deadline (optional)</span><input aria-label="Deadline (optional)" type="date" value={due} onChange={e=>setDue(e.target.value)}/></label><button className="primary" type="submit" disabled={!title.trim()}>Add task <span aria-hidden="true">↗</span></button></form>
        <div className="list-toolbar"><div className="tabs" aria-label="Task views"><button aria-pressed={view==='active'} onClick={()=>setView('active')}>Active <span>{active.length}</span></button><button aria-pressed={view==='completed'} onClick={()=>setView('completed')}>Completed <span>{completed}</span></button></div><span className="saved-label">{saveError || conflict ? 'Not saved' : 'Saved in this browser'}</span></div>
        <ul className="task-list">{shown.map(task => <li key={task.id} className={`task-row ${task.completed?'is-complete':''}`}>
          {editing===task.id ? <form className="edit-form" onSubmit={saveEdit}><label>Task name<input autoFocus aria-label="Edit task name" value={editTitle} onChange={e=>setEditTitle(e.target.value)} maxLength={300} required/></label><label>Deadline<input aria-label="Edit deadline" type="date" value={editDue} onChange={e=>setEditDue(e.target.value)}/></label><div><button type="submit" className="primary" disabled={!editTitle.trim()}>Save changes</button><button type="button" className="text-button" onClick={()=>setEditing(null)}>Cancel</button></div></form> : <>
            <input className="complete-check" type="checkbox" checked={task.completed} aria-label={`${task.completed?'Reopen':'Complete'} ${task.title}`} onChange={()=>update(task.id,{completed:!task.completed,priority:false})}/>
            <div className="task-body"><span className="task-title">{task.title}</span>{task.due && <span className={`due-date ${!task.completed && task.due<localToday()?'overdue':''}`}>{!task.completed && task.due<localToday()?'Overdue · ':''}{displayDate(task.due)}</span>}</div>
            <div className="row-actions">{!task.completed && <button className={`star-button ${task.priority?'selected':''}`} title={task.priority?'Remove from focus':'Add to focus'} aria-label={`${task.priority?'Unprioritize':'Prioritize'} ${task.title}`} aria-pressed={task.priority} disabled={!task.priority && priorities.length>=3} onClick={()=>update(task.id,{priority:!task.priority})}>{task.priority?'★':'☆'}</button>}<button className="text-button" aria-label={`Edit ${task.title}`} onClick={()=>{setEditing(task.id);setEditTitle(task.title);setEditDue(task.due);}}>Edit</button><button className="delete-button" aria-label={`Delete ${task.title}`} onClick={()=>setTasks(current=>current.filter(t=>t.id!==task.id))}>×</button></div>
          </>}
        </li>)}</ul>
        {shown.length===0 && <div className="empty-state"><span className="empty-symbol" aria-hidden="true">{view==='completed'?'✓':'↗'}</span><h3>{view==='completed'?'Good things take small steps.':'A fresh start, just for you.'}</h3><p>{view==='completed'?'Your completed tasks will find a home here.':'Add your first task above. Big plans start small.'}</p></div>}
      </section>
      <footer><span>Built for a little more clarity.</span><span>No accounts. No noise. Just you.</span></footer>
    </main>
  </div>;
}
