const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const db = require('./db-connector.js');

const app = express();
const PORT = 9124;

app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


// RESET FUNCTIONALITY
app.post('/reset', async (req, res) => {
  await db.query('CALL reset_gym_data()');
  res.redirect('/');
});

// load entries

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/members', async (req, res) => {
  const [members] = await db.query('SELECT * FROM members');
  res.render('members', { members });
});

app.get('/trainers', async (req, res) => {
  const [trainers] = await db.query('SELECT * FROM trainers');
  res.render('trainers', { trainers });
});

app.get('/classes', async (req, res) => {
  const [classes] = await db.query('SELECT * FROM classes');
  const [trainers] = await db.query('SELECT * FROM trainers');
  res.render('classes', { classes, trainers });
});

app.get('/class_attendance', async (req, res) => {
  const [attendance] = await db.query('SELECT * FROM class_attendance');
  const [classes] = await db.query('SELECT * FROM classes');
  const [members] = await db.query('SELECT * FROM members');
  res.render('class_attendance', { attendance, classes, members });
});

app.get('/gym_attendance', async (req, res) => {
  const [gym_attendance] = await db.query('SELECT * FROM gym_attendance');
  const [members] = await db.query('SELECT * FROM members');
  res.render('gym_attendance', { gym_attendance, members });
});

app.get('/membership', async (req, res) => {
  const [memberships] = await db.query('SELECT * FROM membership');
  const [members] = await db.query('SELECT * FROM members');
  const [trainers] = await db.query('SELECT * FROM trainers');
  res.render('membership', { memberships, members, trainers });
});

// DELETE FROM TABLES

app.post('/trainers/delete', async (req, res) => {
  const { trainer_ID } = req.body;
  await db.query(
    `DELETE ca FROM class_attendance ca
     JOIN classes c ON ca.class_ID = c.class_ID
     WHERE c.trainer_ID = ?`,
    [trainer_ID]);

  await db.query('DELETE FROM membership WHERE trainer_ID = ?', [trainer_ID]);
  await db.query('DELETE FROM classes WHERE trainer_ID = ?', [trainer_ID]);
  await db.query('DELETE FROM trainers WHERE trainer_ID = ?', [trainer_ID]);
  res.redirect('/trainers');
});

app.post('/membership/delete', async (req, res) => {
  const { membership_ID } = req.body;
  await db.query('DELETE FROM membership WHERE membership_ID = ?', [membership_ID]);
  res.redirect('/membership');
});

app.post('/gym_attendance/delete', async (req, res) => {
  const { gym_attendance_ID } = req.body;
  await db.query('DELETE FROM gym_attendance WHERE gym_attendance_ID = ?', [gym_attendance_ID]);
  res.redirect('/gym_attendance');
});

app.post('/class_attendance/delete', async (req, res) => {
  const { class_ID, member_ID } = req.body;
  await db.query('DELETE FROM class_attendance WHERE class_ID = ? AND member_ID = ?', [class_ID, member_ID]);
  res.redirect('/class_attendance');
});

app.post('/classes/delete', async (req, res) => {
  const { class_ID } = req.body;
  await db.query('DELETE FROM class_attendance WHERE class_ID = ?', [class_ID]);
  await db.query('DELETE FROM classes WHERE class_ID = ?', [class_ID]);
  res.redirect('/classes');
});

app.post('/members/delete', async (req, res) => {
  const memberId = req.body.member_ID;

  await db.query('DELETE FROM class_attendance WHERE member_ID = ?', [memberId]);
  await db.query('DELETE FROM gym_attendance WHERE member_ID = ?', [memberId]);
  await db.query('DELETE FROM membership WHERE member_ID = ?', [memberId]);
  await db.query('DELETE FROM members WHERE member_ID = ?', [memberId]);

  res.redirect('/members');
});

// ADD TO TABLES

app.post('/trainers/add', async (req, res) => {
  const { name, specialization, email, phone, availability } = req.body;
  await db.query(
    'INSERT INTO trainers (name, specialization, email, phone, availability) VALUES (?, ?, ?, ?, ?)',
    [name, specialization, email, phone, availability]);
  res.redirect('/trainers');
});

app.post('/membership/add', async (req, res) => {
  const { member_id, trainer_id, type, start_date, end_date } = req.body;
  await db.query(
    `INSERT INTO membership (member_ID, trainer_ID, type, start_date, end_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [member_id, trainer_id, type, start_date, end_date]);
  res.redirect('/membership');
});

app.post('/gym_attendance/add', async (req, res) => {
  const { member_id, date } = req.body;
  await db.query(
    'INSERT INTO gym_attendance (member_ID, date) VALUES (?, ?)',
    [member_id, date]);
  res.redirect('/gym_attendance');
});

app.post('/class_attendance/add', async (req, res) => {
  const { class_id, member_id, date } = req.body;
  await db.query(
    'INSERT INTO class_attendance (class_ID, member_ID, date) VALUES (?, ?, ?)',
    [class_id, member_id, date]);
  res.redirect('/class_attendance');
});

app.post('/classes/add', async (req, res) => {
  const { name, description, schedule, trainer_id, capacity } = req.body;
  await db.query(
    'INSERT INTO classes (name, description, schedule, trainer_ID, capacity) VALUES (?, ?, ?, ?, ?)',
    [name, description, schedule, trainer_id, capacity]);
  res.redirect('/classes');
});

app.post('/members/add', async (req, res) => {
  const { name, email, phone } = req.body;
  await db.query(
    'INSERT INTO members (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);
  res.redirect('/members');
});

// UPDATE TABLES

app.post('/trainers/update', async (req, res) => {
  const { trainer_ID, name, specialization, email, phone, availability } = req.body;
  await db.query(
    `UPDATE trainers SET name=?, specialization=?,
     email=?, phone=?, availability=? WHERE trainer_ID=?`,
    [name, specialization, email, phone, availability, trainer_ID]);
  res.redirect('/trainers');
});



app.post('/membership/update', async (req, res) => {
  const { membership_ID, member_ID, trainer_ID, type, start_date, end_date } = req.body;
  await db.query(
    `UPDATE membership SET member_ID = ?, 
     trainer_ID = ?, type = ?, start_date = ?,
     end_date = ? WHERE membership_ID = ?`,
    [member_ID, trainer_ID, type, start_date, end_date, membership_ID]);
  res.redirect('/membership');
});

app.post('/gym_attendance/update', async (req, res) => {
  const { gym_attendance_ID, member_ID, date } = req.body;
  await db.query(
    `UPDATE gym_attendance 
     SET member_ID = ?, date = ? 
     WHERE gym_attendance_ID = ?`,
    [member_ID, date, gym_attendance_ID]);
  res.redirect('/gym_attendance');
});

app.post('/class_attendance/update', async (req, res) => {
  const { old_class_ID, old_member_ID, new_class_ID, new_member_ID, new_date } = req.body;
  await db.query(
    `UPDATE class_attendance SET class_ID = ?,
     member_ID = ?, date = ?
     WHERE class_ID = ? AND member_ID = ?`,
    [new_class_ID, new_member_ID, new_date, old_class_ID, old_member_ID]);
  res.redirect('/class_attendance');
});

app.post('/classes/update', async (req, res) => {
  const { class_ID, name, description, schedule, trainer_id, capacity } = req.body;
  await db.query(
    `UPDATE classes
     SET name = ?, description = ?, schedule = ?, trainer_ID = ?, capacity = ?
     WHERE class_ID = ?`,
    [name, description, schedule, trainer_id, capacity, class_ID]);
  res.redirect('/classes');
});

app.post('/members/update', async (req, res) => {
  const { member_ID, name, email, phone } = req.body;
  await db.query(
    'UPDATE members SET name=?, email=?, phone=? WHERE member_ID=?',
    [name, email, phone, member_ID]);
  res.redirect('/members');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://classwork.engr.oregonstate.edu:${PORT}`);
});
