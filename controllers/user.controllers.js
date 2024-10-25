import User from "../models/user.model.js";

export const createProfile = async (req, res, next) =>{
    try {
        const file = req.file;
        const body = req.body;
        const userId = req.userId;

        const { firstName, lastName } = body

        if(!firstName || !lastName){
            return res.status(400).json({ message: 'Please provide firstName and lastName' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                firstName: firstName,
                lastName: lastName,
                isSetupProfile: true,
                imageUrl: fileUrl,
            },
            { new : true }
        )

        res.status(200).json({
            success: true, user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerify: user.isVerify,
                imageUrl: user.imageUrl,
                isSetupProfile: user.isSetupProfile
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const editProfile = async (req, res, next) =>{
    try {
        const file = req.file;
        const body = req.body;
        const userId = req.params.userId;;

        const { firstName, lastName } = body

        if(!userId){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!firstName && !lastName && !file) {
            return res.status(400).json({ message: 'Please provide at least one of firstName, lastName, or file' });
        }

        const data = {  
        }


        if(firstName){
            data.firstName = firstName
        }
        if(lastName){
            data.lastName = lastName
        }

        if (file) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${file.filename}`;
            data.imageUrl = fileUrl; 
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...data,
            },
            { new : true }
        )

        res.status(200).json({
            success: true, user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                isVerify: updatedUser.isVerify,
                imageUrl: updatedUser.imageUrl,
                isSetupProfile: updatedUser.isSetupProfile
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const getAllUsers = async (req, res, next) => {
    try {
      const userId = req.userId;
      const cursor = parseInt(req.query.cursor) || 1; 
      const limit = parseInt(req.query.limit) || 10; 

      if(!userId){
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const users = await User.find({ _id: { $ne: userId } })
        .skip((cursor - 1) * limit)
        .limit(limit);
  
      const totalUsers = await User.countDocuments({ _id: { $ne: userId } });
      const hasNextPage = cursor * limit < totalUsers;
  
      return res.status(200).json({
        success: true,
        users: users,
        nextCursor: hasNextPage ? cursor + 1 : null, 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  