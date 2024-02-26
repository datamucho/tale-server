import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model"; // Adjust the path as necessary
import nodemailer from "nodemailer";
import { Express } from "express";

const SECRET_KEY = "your_secret_key"; // Replace with your actual secret key

declare module "express-serve-static-core" {
  interface Request extends Express.Request {
    user?: any;
  }
}
// Middleware to validate token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

// Controller for user registration
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const user = new User({
    email,
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();
    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
      expiresIn: "365d",
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your preferred service
      auth: {
        user: "yourEmail@gmail.com", // Your email
        pass: "yourEmailPassword", // Your email password
      },
    });

    const mailOptions = {
      from: "youremail@gmail.com",
      to: newUser.email,
      subject: "Account Verification Token",
      text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://${req.headers.host}/confirmation/${token}\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      } else {
        return res
          .status(200)
          .send("A verification email has been sent to " + newUser.email + ".");
      }
    });
  } catch (error) {
    res.status(500).send("There was a problem registering the user.");
  }
};

// Controller for user login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("The email does not exist");
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "24h" });
    res.status(200).send({ auth: true, token });
  } catch (error) {
    res.status(500).send("Error on the server.");
  }
};

// Example usage of the verifyToken middleware
// app.get('/api/resource', verifyToken, (req, res) => {
//     res.status(200).send("This is a protected resource");
// });
