const { db } = require('../config/database');

function getStepsByFaultId(faultId) {
  return db.prepare(
    'SELECT * FROM steps WHERE fault_id = ? ORDER BY step_order ASC'
  ).all(faultId);
}

module.exports = { getStepsByFaultId };
