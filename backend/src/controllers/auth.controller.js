import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
import cloudinary from "../lib/cloudinary.js";

export async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use different one." });
    }

    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${randomNumber}.png`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (error) {
      console.log("Error upserting Stream user: ", error.message);
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 0,
    });

    res.status(201).json({ success: true, message: "logout successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePicUrl,
    } = req.body;

    // Log the received data
    console.log("Received onboarding data:", {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      hasFile: !!req.file,
      profilePicUrl,
    });

    // Validate all required fields are present and not empty strings
    const requiredFields = {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim().length === 0)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return res.status(400).json({
        message: "All fields are required",
        missingFields,
      });
    }

    // Clean the data before updating
    const updateData = {
      fullName: fullName.trim(),
      bio: bio.trim(),
      nativeLanguage: nativeLanguage.trim().toLowerCase(),
      learningLanguage: learningLanguage.trim().toLowerCase(),
      location: location.trim(),
      isOnboarded: true,
    };

    // Handle profile picture
    if (req.file) {
      // If a new file was uploaded, process it with cloudinary
      try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        });
        updateData.profilePic = cldRes.secure_url;
      } catch (error) {
        console.log("Error uploading to cloudinary:", error.message);
      }
    } else if (profilePicUrl) {
      // If no new file but a URL was provided, use that
      updateData.profilePic = profilePicUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic,
      });
    } catch (error) {
      console.log(
        "Error updating Stream user during onboarding:",
        error.message
      );
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in onboard controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}
