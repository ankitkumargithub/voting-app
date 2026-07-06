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
        userId = req.user.id;
        candidateId = req.params.candidateId;
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ error: 'User has already voted' });
        }

        if (user.role !== 'voter') {
            return res.status(403).json({ error: 'Only voters can vote' });
        }

        // Increment the vote count for the candidate
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });

    } catch (error) {
        console.log('Error occurred while voting:', error);
        res.status(500).json({ error: 'Error occurred while voting', details: error });
    }
});


router.get('/votes/count', async(req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc'});

        const voteCounts = candidates.map(candidate => ({
            candidateParty: candidate.party ,
            candidateName: candidate.name,
            voteCount: candidate.voteCount
        }));
        res.status(200).json(voteCounts);
    } catch (error) {
        console.log('Error occurred while fetching vote count:', error);
        res.status(500).json({ error: 'Error occurred while fetching vote count', details: error });
    }
});


module.exports = router;