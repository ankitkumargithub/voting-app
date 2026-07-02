const express = require('express');

const router = express.Router();
const User = require('./../models/User');

const {jwtMiddleware, generateToken} = require('./../jwt.js');


router.post('/signup', async(req, res) => {
    try{
    const data = req.body;
    
    //checking if admin already exists
    if(data.role && data.role === 'admin'){
        const existingAdmin = await User.findOne({ role: 'admin' });
        if(existingAdmin){
            return res.status(400).json({ error: 'Admin user already exists' });
        }
    }
    const user = new User(data);

    const response = await user.save();
    console.log('User saved successfully:', response);

    const payload = {
        id: response.id,
    }
    const token = generateToken(payload);

    res.status(201).json({response: response, token: token});

    }catch(error){
        console.log('Error saving user:', error);
        res.status(500).json({ error: 'Error saving user', details: error });
        
    }
});

//login route

router.post('/login', async(req, res) => {
    try{
        const {aadharCardNumber, password} = req.body;
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        if(!user || !await user.comparePassword(password)){
            return res.status(401).json({ message: 'Invalid aadhar card number or password'});
        }

        // Generate JWT token

        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        res.status(200).json({ message: 'Login successful', token: token});
    }
    catch(error){
        console.log('Error during login:', error);
        res.status(500).json({ error: 'Error during login', details: error });
    }
});

//profile route
router.get('/profile', jwtMiddleware, async(req, res) => {
    try{
        const userData = req.user;
        console.log('User data from token:', userData);
        const user = await User.findById(userData.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);   
    } catch (error) {
        console.log('Error fetching profile:', error);
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile', details: error });
    }
});



router.put("/profile/password", async(req, res) => {
    try {
        const id = req.user;
        const {currentPassword, newPassword} = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!await user.comparePassword(currentPassword)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword;
        const updatedUser = await user.save();
        res.status(200).json({ message: 'Password updated successfully', user: updatedUser });
        if(!user){
            return res.status(404).json({ error: 'User not updated.' }); 
        }     
        console.log('User updated successfully:', user);     
        res.status(200).json(user);

    } catch (error) {
        console.log('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user', details: error });
    }
});




module.exports = router;