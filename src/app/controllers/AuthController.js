const { User } = require('../models');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } =  req.body;

            const user = await User.findOne({ where: { email } });

            if(user) {
                return res.status(400).json({message: 'User already exists!'});
            }

            const newUser = await User.create({
                name,
                email,
                password
            })

            return res.status(200).json({
                newUser,
                token: newUser.generateToken()
            });

        } catch(err) {
            return res.status(400).json({message: err});
        }
    }

    async login(req, res) {
        try {
            const { email, password } =  req.body;

            const user = await User.findOne({ where: { email } });

            if(!user) {
                return res.status(401).json({message: 'User not found!'});
            }

            if(!(await user.checkPassword(password))) {
                return res.status(401).json({message: 'Invalid credentials!'});
            }

        return res.status(200).json({
            user,
            token: user.generateToken()
        });

        } catch(err) {
            return res.status(400).json({message: err});
        }
    }
}

module.exports = new AuthController();