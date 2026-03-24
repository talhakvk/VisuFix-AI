-- Arızalar Tablosu
CREATE TABLE faults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Simülasyon Adımları Tablosu
CREATE TABLE steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fault_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    x_coordinate REAL NOT NULL,
    y_coordinate REAL NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (fault_id) REFERENCES faults(id) ON DELETE CASCADE
);