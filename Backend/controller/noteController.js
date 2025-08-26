const Note = require('../models/noteModel');
const User = require('../models/userModel');


exports.createNote = async (req, res) => {
    try{
        const {userId , content} = req.body
        //validate required fields
        if(!userId|| !content){
            return res.status(400).json({message: "User ID and conten are required"})
        }

        // find user by id 

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        // create note 
        const note = new Note({
            owner: user._id,
            content: content
        })

        await note.save();
        res.status(201).json({message:"Note created successfully", note})
    }
    catch(error){
        res.status(500).json({message:"Error creating the note"})
    }
}


exports.deleteNote = async(req, res) => {
    try{
        const noteId = req.params.noteId.trim()

        if(!noteId){
            return res.status(404).json({message:"Note ID is not valid or required"});
        }

        const note = await Note.findByIdAndDelete(noteId)
        if(!note){
            return res.status(404).json({message:"Note not found"});
        }
        res.status(200).json({message:"Note deleted successfully"})
    }
    catch(error){
        res.status(500).json({message: "Error deleting the note"})
    }
}

exports.getUserNotes = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate userId
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch all notes created by the user
      const notes = await Note.find({ owner: userId }).sort({ createdAt: -1 }); // Sort by most recent first
  
      res.status(200).json({ notes });
    } catch (error) {
      console.error("Error fetching user notes:", error);
      res.status(500).json({ message: "Error fetching user notes", error: error.message });
    }
  };

  exports.updateNote = async (req, res) => {
    try {
        const { noteId } = req.params; // Get the note ID from the request parameters
        const { content } = req.body; // Get the updated content from the request body

        // Validate required fields
        if (!noteId || !content) {
            return res.status(400).json({ message: "Note ID and content are required" });
        }

        // Find the note by ID and update its content
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { content },
            { new: true } // Return the updated note
        );

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ message: "Error updating note", error: error.message });
    }
};