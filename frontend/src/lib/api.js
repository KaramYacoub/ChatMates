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
  const formData = new FormData();

  // Add all text fields
  formData.append('fullName', onboardingData.fullName?.trim() || '');
  formData.append('bio', onboardingData.bio?.trim() || '');
  formData.append('nativeLanguage', onboardingData.nativeLanguage?.trim() || '');
  formData.append('learningLanguage', onboardingData.learningLanguage?.trim() || '');
  formData.append('location', onboardingData.location?.trim() || '');

  // Handle profile picture
  if (onboardingData.profilePic) {
    if (onboardingData.profilePic instanceof File) {
      formData.append('profilePic', onboardingData.profilePic);
    } else if (typeof onboardingData.profilePic === 'string') {
      formData.append('profilePicUrl', onboardingData.profilePic);
    }
  }

  try {
    const response = await axiosInstance.post("/auth/onboarding", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Onboarding error:', error.response?.data);
    throw error;
  }
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

export const getStreamToken = async () => {
  const repsonse = await axiosInstance.get("/chat/token");
  return repsonse.data;
};

export const markAcceptedRequestSeen = async (id) => {
  const response = await axiosInstance.patch(`/users/friend-request/${id}/seen`);
  return response.data;
};

export const deleteAcceptedRequest = async (id) => {
  const response = await axiosInstance.delete(`/users/friend-request/${id}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const formData = new FormData();

  // Add all text fields
  formData.append('fullName', profileData.fullName?.trim() || '');
  formData.append('bio', profileData.bio?.trim() || '');
  formData.append('nativeLanguage', profileData.nativeLanguage?.trim() || '');
  formData.append('learningLanguage', profileData.learningLanguage?.trim() || '');
  formData.append('location', profileData.location?.trim() || '');

  // Handle profile picture
  if (profileData.profilePic) {
    if (profileData.profilePic instanceof File) {
      formData.append('profilePic', profileData.profilePic);
    } else if (typeof profileData.profilePic === 'string') {
      formData.append('profilePicUrl', profileData.profilePic);
    }
  }

  try {
    const response = await axiosInstance.put("/users/profile", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error.response?.data);
    throw error;
  }
};