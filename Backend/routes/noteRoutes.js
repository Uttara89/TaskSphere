const express = require('express');
const router = express.Router();

const {createNote, deleteNote, getUserNotes, updateNote} =  require('../controller/noteController')

router.post('/api/notes', createNote);

router.delete('/api/notes/:noteId', deleteNote);

router.get('/user/:userId/notes', getUserNotes);

router.put('/notes/:noteId', updateNote);

module.exports = router