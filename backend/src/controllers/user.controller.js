import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import cloudinary from '../lib/cloudinary.js';
import streamifier from 'streamifier';
import upload from '../middlewares/upload.middleware.js';

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending request to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);

    // check if recipient exists
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    // check if the user already friend with the recipient
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(200).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: recipientId } = req.params;

    const friendRequest = await FriendRequest.findById(recipientId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // verfiy the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You aren't autherized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they don't already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    return res.status(200).json({ incomingRequests, acceptedRequests });
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    return res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error(
      "Error in getOutgoingFriendRequests controller:",
      error.message
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markAcceptedRequestSeen(req, res) {
  try {
    const { id } = req.params;
    const request = await FriendRequest.findById(id);
    if (!request || request.status !== "accepted") {
      return res.status(404).json({ message: "Accepted request not found" });
    }
    if (request.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    request.seen = true;
    await request.save();
    return res.status(200).json({ message: "Request marked as seen" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAcceptedRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await FriendRequest.findById(id);
    if (!request || request.status !== "accepted") {
      return res.status(404).json({ message: "Accepted request not found" });
    }
    if (request.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await request.deleteOne();
    return res.status(200).json({ message: "Accepted request deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'avatars' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function updateProfile(req, res) {
  try {
    let profilePicUrl = req.user.profilePic; // default to existing

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profilePicUrl = result.secure_url;
    }

    // Collect updatable fields
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    // Update user with new profilePicUrl and other fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic: profilePicUrl,
      },
      { new: true }
    );

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading avatar' });
  }
}
