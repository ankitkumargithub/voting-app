const express = require('express');

const router = express.Router();
const Candidate = require('../models/Candidate');
const User = require('../models/User');


const {jwtMiddleware, generateToken} = require('../jwt.js');

const checkAdminRole = async (userID) =>{
    try {
        console.log("Checking admin role:", userID);

        const user = await User.findById(userID);

        console.log(user);

        if (!user) {
            return false;
        }

        return user.role === "admin";

    } catch (err) {
        console.log(err);
        return false;
    }
    
}

router.post('/', jwtMiddleware,async(req, res) => {
    try{
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({ message: 'Forbidden: Only admin can add candidates' });
        }
    const data = req.body;
    const candidate = new Candidate(data);

    const response = await candidate.save();
    console.log('Candidate saved successfully:', response);

    res.status(201).json({response: response});

    }catch(error){
        console.log('Error saving candidate:', error);
        res.status(500).json({ error: 'Error saving candidate', details: error });
        
    }
});



router.put("/:candidateId", jwtMiddleware, async(req, res) => {
    try {
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({ message: 'Forbidden: Only admin can update candidates' });
        }
        const id = req.params.candidateId;
        const updateUserData = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(id, updateUserData, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json(updatedUser);
        console.log('Candidate updated successfully:', updatedUser);
    } catch (error) {
        console.log('Error updating candidate:', error);
        res.status(500).json({ error: 'Error updating candidate', details: error });
    }
});

router.delete("/:candidateId", jwtMiddleware, async(req, res) => {
    try {
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({ message: 'Forbidden: Only admin can delete candidates' });
        }
        const id = req.params.candidateId;
        
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json(deletedUser);
        console.log('Candidate deleted successfully:', deletedUser);
    } catch (error) {
        console.log('Error deleting candidate:', error);
        res.status(500).json({ error: 'Error deleting candidate', details: error });
    }
});

router.post("/vote/:candidateId", jwtMiddleware, async(req, res) => {
    try {
        //only voters can vote
        // Check if the user has already voted
    }
    catch (error) {

    }
});



module.exports = router;