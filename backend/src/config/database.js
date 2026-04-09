const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../visufix.db'));

db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS faults (
      id         INTEGER  PRIMARY KEY AUTOINCREMENT,
      photo_url  TEXT     NOT NULL,
      status     TEXT     DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS steps (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      fault_id    INTEGER NOT NULL,
      step_order  INTEGER NOT NULL,
      coord_x     REAL    NOT NULL,
      coord_y     REAL    NOT NULL,
      description TEXT    NOT NULL,
      FOREIGN KEY (fault_id) REFERENCES faults(id) ON DELETE CASCADE
    );
  `);
  console.log('Database initialized.');
}

module.exports = { db, initDB };
