import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const repsonse = await axiosInstance.post("/auth/signup", signupData);
  return repsonse.data;
};

export const login = async (loginData) => {
  const repsonse = await axiosInstance.post("/auth/login", loginData);
  return repsonse.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch {
    return null;
  }
};

export const completeOnboarding = async (onboardingData) => {
  const repsonse = await axiosInstance.post("/auth/onboarding", onboardingData);
  return repsonse.data;
};

export const logout = async () => {
  const repsonse = await axiosInstance.post("/auth/logout");
  return repsonse.data;
};

export const getUserFriends = async () => {
  const repsonse = await axiosInstance.get("/users/friends");
  return repsonse.data;
};

export const getRecommendedUsers = async () => {
  const repsonse = await axiosInstance.get("/users");
  return repsonse.data;
};

export const getOutgoingFriendReqs = async () => {
  const repsonse = await axiosInstance.get("/users/outgoing-friend-request");
  return repsonse.data;
};


export const getFriendRequests = async () => {
  const repsonse = await axiosInstance.get("/users/friend-request");
  return repsonse.data;
};

export const sendFriendRequest = async (userId) => {
  const repsonse = await axiosInstance.post(`/users/friend-request/${userId}`);
  return repsonse.data;
};

export const acceptFriendRequest = async (userId) => {
  const repsonse = await axiosInstance.put(`/users/friend-request/${userId}/accept`);
  return repsonse.data;
};

// export const rejectFriendRequest = async (userId) => {
//   const repsonse = await axiosInstance.put(`/users/friend-request/${userId}/reject`);
//   return repsonse.data;
// };

export const getStreamToken = async () => {
  const repsonse = await axiosInstance.get("/chat/token");
  return repsonse.data;
}