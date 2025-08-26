const Group = require('../models/groupModel');
const uploadOnCloudinary = require('../utils/cloudinary');


const mongoose = require('mongoose');

//? this controller is used to display all the gruops of a user


exports.getUserGroups = async(req, res) =>{

    try
    {const {userId} = req.params;
    console.log('getUserGroups called with userId:', userId); // Debug log

    //validate the userId
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({message: "Invalid user ID"});
    }

    //Find all the projects where the user is a member
    const groups = await Group.find({members: userId})
    .populate('members', 'email name'); // Populate member details

    console.log('Found groups for user:', groups.length); // Debug log
    console.log('Groups details:', JSON.stringify(groups, null, 2)); // Debug log

    res.status(200).json({groups})
    }
    catch(error){
        console.log('Error getting user groups:', error);
        res.status(500).json({message: 'Error getting user groups', error: error.message});
    }
}

exports.getAllGroups = async (req, res) => {
    try {
      console.log("reached here")
      const groups = await Group.find().populate('members', 'email name');
      console.log(groups);
      res.status(200).json({ groups });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
  };

  exports.uploadGroupDocument = async(req, res) => {
    try{
      const groupId = req.params.groupId;
      const uploaderId = req.body.uploaderId
      

      if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({message: "Invalid group ID"})
      }
      if(!mongoose.Types.ObjectId.isValid(uploaderId)){
        return res.status(400).json({message: "Invalid uploader ID"})
      }

      if(!req.file){
        return res.status(400).json({message: "No file uploaded"})
      }

      const uploadResponse = await uploadOnCloudinary(req.file.path);
      if (!uploadResponse) {
        return res.status(500).json({ message: 'File upload to Cloudinary failed' });
      }
  
      // Update the group's sharedFiles array with file details
      const fileData = {
        uploader: uploaderId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        cloudinaryUrl: uploadResponse.secure_url,
        cloudinaryPublicId: uploadResponse.public_id,
        uploadedAt: new Date()
      };
  
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      group.sharedFiles.push(fileData);

      // Create a message with file attachment
      const messageWithFile = {
        sender: uploaderId,
        content: `📎 Shared a file: ${req.file.originalname}`,
        timestamp: new Date(),
        attachment: {
          fileName: req.file.originalname,
          cloudinaryUrl: uploadResponse.secure_url,
          cloudinaryPublicId: uploadResponse.public_id,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        }
      };

      group.messages.push(messageWithFile);
      await group.save();

      // Populate sender information for the new message
      await group.populate('messages.sender', 'name email');
      const savedMessage = group.messages[group.messages.length - 1];

      // Emit the new message with file to all group members via socket
      const io = req.app.get('io'); // Get io instance from app
      if (io) {
        io.to(groupId).emit('newMessage', {
          groupId,
          sender: savedMessage.sender,
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          attachment: savedMessage.attachment,
        });
      }
  
      res.status(200).json({ 
        message: 'File uploaded and shared in group chat', 
        file: fileData,
        messageId: savedMessage._id 
      });

    }catch(error){
      console.error('Error uploading group document:', error);
      res.status(500).json({ message: 'Error uploading group document', error: error.message });
    }
  }

  // Get shared files for a group
  exports.getGroupFiles = async(req, res) => {
    try {
      const groupId = req.params.groupId;

      if(!mongoose.Types.ObjectId.isValid(groupId)){
        return res.status(400).json({message: "Invalid group ID"})
      }

      const group = await Group.findById(groupId)
        .select('sharedFiles')
        .populate('sharedFiles.uploader', 'name email');

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      res.status(200).json({ files: group.sharedFiles });

    } catch(error) {
      console.error('Error fetching group files:', error);
      res.status(500).json({ message: 'Error fetching group files', error: error.message });
    }
  }



  //? the messagefs autodelete after 5 days
  //? users can uplaod files 
  //? realtime messaging using socket io
  