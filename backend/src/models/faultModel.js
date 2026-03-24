const { db } = require('../config/database');

function createFault(photoUrl) {
  const stmt = db.prepare(
    'INSERT INTO faults (photo_url) VALUES (?)'
  );
  const result = stmt.run(photoUrl);
  return db.prepare('SELECT * FROM faults WHERE id = ?').get(result.lastInsertRowid);
}

function getAllFaults() {
  return db.prepare('SELECT * FROM faults ORDER BY created_at DESC').all();
}

function getFaultById(id) {
  return db.prepare('SELECT * FROM faults WHERE id = ?').get(id);
}

function deleteFault(id) {
  const result = db.prepare('DELETE FROM faults WHERE id = ?').run(id);
  return result.changes;
}

function updateFaultStatus(id, status) {
  const stmt = db.prepare('UPDATE faults SET status = ? WHERE id = ?');
  return stmt.run(status, id);
}

module.exports = { createFault, getAllFaults, getFaultById, deleteFault, updateFaultStatus };
