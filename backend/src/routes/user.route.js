import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendRequests,
  getRecommendedUsers,
  sendFriendRequest,
  markAcceptedRequestSeen,
  deleteAcceptedRequest,
  updateProfile,
} from "../controllers/user.controller.js";
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-request", getFriendRequests);
router.get("/outgoing-friend-request", getOutgoingFriendRequests);

router.patch("/friend-request/:id/seen", markAcceptedRequestSeen);
router.delete("/friend-request/:id", deleteAcceptedRequest);

router.put('/profile', upload.single('profilePic'), updateProfile);

export default router;
