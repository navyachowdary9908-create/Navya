const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db = {};
function loadDB() {
  try {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
  } catch (e) {
    db = { appointments: [], menu: [{ title: 'Home', url: '/' }, { title: 'Schedule', url: '/schedule' }] };
  }
  db.appointments = db.appointments || [];
}

function saveDB() {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
}

app.get('/api/menu', (req, res) => {
  loadDB();
  res.json(db.menu || []);
});

app.get('/api/appointments', (req, res) => {
  loadDB();
  let items = [...db.appointments];
  const status = req.query.status;
  const q = req.query.q;
  if (status) items = items.filter(a => a.status === status);
  if (q) items = items.filter(a =>
    a.title.toLowerCase().includes(q.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(q.toLowerCase()));
  res.json(items);
});

app.post('/api/appointments', (req, res) => {
  loadDB();
  const { title, description, start_time, end_time, user_id, color, status } = req.body;
  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({ error: 'end_time must be after start_time' });
  }
  const id = db.appointments.length > 0 ? Math.max(...db.appointments.map(a => a.id)) + 1 : 1;
  const appointment = {
    id,
    title: title.trim(),
    description: description?.trim() || '',
    start_time,
    end_time,
    user_id: user_id || '1',
    color: color || '#4f46e5',
    status: status || 'pending',
    created_at: new Date().toISOString()
  };
  db.appointments.push(appointment);
  saveDB();
  res.json(appointment);
});

app.put('/api/appointments/:id', (req, res) => {
  loadDB();
  const id = parseInt(req.params.id);
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { title, description, start_time, end_time, user_id, color, status } = req.body;
  db.appointments[idx] = {
    ...db.appointments[idx],
    title: title?.trim() || db.appointments[idx].title,
    description: description?.trim() || db.appointments[idx].description,
    start_time: start_time || db.appointments[idx].start_time,
    end_time: end_time || db.appointments[idx].end_time,
    user_id: user_id || db.appointments[idx].user_id,
    color: color || db.appointments[idx].color,
    status: status || db.appointments[idx].status
  };
  saveDB();
  res.json(db.appointments[idx]);
});

app.delete('/api/appointments/:id', (req, res) => {
  loadDB();
  const id = parseInt(req.params.id);
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.appointments.splice(idx, 1);
  saveDB();
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Appointment Scheduler running at http://localhost:' + PORT);
});
