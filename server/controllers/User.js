import bcrypt from "bcryptjs";
import User from "./../models/User.js";
import jwt from "jsonwebtoken"


const postSignup = async (req, res) => {
    const { name, email, phone, address, password, rePassword } = req.body;

    if (!password) {
        return res.status(400).json({ success: false, message: "Passwords is required" });
    }
    if (!rePassword) {
        return res.status(400).json({ success: false, message: "rePasswords is required" });
    }

    if (password !== rePassword) {
        return res.status(400).json({ success: false, message: "Passwords does not match" });
    }

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!phone) {
        return res.status(400).json({ success: false, message: "Phone is required" });
    }
    if (!address) {
        return res.status(400).json({ success: false, message: "Address is required" });
    }

    //TODO: move this to env
    const salt = bcrypt.genSaltSync(10);

    try {
        const newUser = new User({
            name,
            email,
            phone,
            address,
            password: bcrypt.hashSync(password, salt),
        });

        const savedUser = await newUser.save();

        return res.json({
            success: true,
            message: "Signup successful",
            data: {
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                address: savedUser.address,
            },
        });
    } catch (error) {
        return res
            .status(400)
            .json({ success: false, message: error.message });
    }
};

const postLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({ success: false, message: "Please signup first before logging in"});
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (isPasswordMatch){
        const jwtToken = jwt.sign({email: user.email, role: user.role, id: user._id}, process.env.JWT_SECRET);

        res.setHeader("Authorization",`Bearer ${jwtToken}`);

        return res.json({ 
            success: true,
            token: jwtToken, 
            message: "Login successful"
        });
    }
    else{
        return res.status(400).json({ success: false, message: "Invalid Credentials"});
    }
}


export { postSignup, postLogin }