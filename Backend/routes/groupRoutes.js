const express = require('express');
const router = express.Router();
const { uploadGroupDocument, getAllGroups, getUserGroups, getGroupFiles } = require('../controller/groupController');
const { upload } = require('../middleware/multerMiddleware');
// Get all groups (projects) a user is part of
router.get('/user/:userId/groups', getUserGroups);

router.post('/api/groups/:groupId/upload', upload.single('document'), uploadGroupDocument);

router.get('/api/groups/:groupId/files', getGroupFiles);

router.get('/api/groups' , getAllGroups)
 // Retrieve messages for a group

module.exports = router;