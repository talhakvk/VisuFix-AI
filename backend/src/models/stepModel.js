const { db } = require('../config/database');

function getStepsByFaultId(faultId) {
  return db.prepare(
    'SELECT * FROM steps WHERE fault_id = ? ORDER BY step_order ASC'
  ).all(faultId);
}

function createSteps(faultId, steps) {
  const insert = db.prepare(`
    INSERT INTO steps (fault_id, step_order, coord_x, coord_y, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((stepsToInsert) => {
    for (const step of stepsToInsert) {
      insert.run(faultId, step.step_order, step.coord_x, step.coord_y, step.description);
    }
  });

  insertMany(steps);
}

module.exports = { getStepsByFaultId, createSteps };
