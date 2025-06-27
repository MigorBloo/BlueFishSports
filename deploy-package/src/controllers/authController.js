const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToS3, getPublicUrl } = require('../services/s3Service');
const userService = require('../services/userService');

const authController = {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, username, residence } = req.body;
      const profileLogo = req.file;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !username || !residence) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Upload profile logo to S3 if provided
      let profileLogoUrl = null;
      if (profileLogo) {
        profileLogoUrl = await uploadToS3(profileLogo, 'profile-logos');
      }

      // Create user
      const user = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
        username,
        residence,
        profileLogo: profileLogoUrl
      });

      // Generate access token (short-lived)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // 1 hour
      );

      // Generate refresh token (long-lived)
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // 7 days
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileLogo: user.profileLogo
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await userService.validatePassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate access token (short-lived)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // 1 hour
      );

      // Generate refresh token (long-lived)
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // 7 days
      );

      // Return user data without password
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileLogo: user.profileLogo
      };

      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login'
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profileLogo: user.profileLogo
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting profile'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      console.log('Update profile request received:', {
        body: req.body,
        file: req.file,
        user: req.user,
        contentType: req.headers['content-type']
      });

      // Get current user data
      const currentUser = await userService.getUserById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prepare update data, preserving existing values if not provided
      const updateData = {
        firstName: req.body.firstName || currentUser.firstName,
        lastName: req.body.lastName || currentUser.lastName,
        username: req.body.username || currentUser.username,
        residence: req.body.residence || currentUser.residence
      };

      // Handle profile logo
      if (req.file) {
        console.log('Uploading profile logo file to S3:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          bucket: process.env.S3_BUCKET_NAME,
          region: process.env.AWS_REGION
        });

        try {
          updateData.profileLogo = await uploadToS3(req.file, 'profile-logos');
          console.log('Successfully uploaded to S3. URL:', updateData.profileLogo);
        } catch (error) {
          console.error('S3 upload error:', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            bucket: process.env.S3_BUCKET_NAME,
            region: process.env.AWS_REGION
          });
          return res.status(500).json({
            success: false,
            message: 'Error uploading profile image',
            error: error.message
          });
        }
      }

      // Update user
      console.log('Updating user in database:', {
        id: req.user.id,
        updates: {
          ...updateData,
          profileLogo: updateData.profileLogo ? 'present' : 'not updated'
        }
      });

      const updatedUser = await userService.updateUser(req.user.id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User updated successfully:', {
        id: updatedUser.id,
        username: updatedUser.username,
        hasProfileLogo: !!updatedUser.profileLogo,
        profileLogo: updatedUser.profileLogo
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileLogo: updatedUser.profileLogo
        }
      });
    } catch (error) {
      console.error('Update profile error:', {
        error: error.message,
        stack: error.stack,
        user: req.user ? { id: req.user.id, email: req.user.email } : 'No user'
      });
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await userService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // 1 hour
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // 7 days
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
};

module.exports = authController; 