const pool = require('../config/db');

const createEvent = async (eventData) => {
    const { title, description, date, location, organizer_id } = eventData;
    const [result] = await pool.query(
        'INSERT INTO events (title, description, date, location, organizer_id) VALUES (?, ?, ?, ?, ?)',
        [title, description, date, location, organizer_id]
    );
    return result.insertId;
};

const getAllEvents = async () => {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY date ASC');
    return rows;
};

const getEventById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0];
};

const updateEvent = async (id, eventData) => {
    const { title, description, date, location } = eventData;
    const [result] = await pool.query(
        'UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?',
        [title, description, date, location, id]
    );
    return result.affectedRows;
};

const deleteEvent = async (id) => {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
