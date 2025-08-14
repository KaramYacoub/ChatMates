import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api";
import toast from "react-hot-toast";
import { CameraIcon, Loader2 } from "lucide-react";
import { LANGUAGES } from "../constants/constants-index";

const ProfilePage = () => {
  const { authUser, isLoading } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    profilePic: "",
    location: "",
  });

  // Update form state when authUser changes
  useEffect(() => {
    if (authUser) {
      setFormState({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        nativeLanguage: authUser.nativeLanguage || "",
        learningLanguage: authUser.learningLanguage || "",
        profilePic: authUser.profilePic || "",
        location: authUser.location || "",
      });
    }
  }, [authUser]);

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormState({ ...formState, profilePic: file });
    }
  };

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create form data with all fields
    const updatedData = {
      ...formState,
      // If profilePic is a string (URL) and hasn't changed from authUser, don't send it
      profilePic: typeof formState.profilePic === 'string' && formState.profilePic === authUser?.profilePic
        ? undefined
        : formState.profilePic
    };

    updateMutation(updatedData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  typeof formState.profilePic === 'string' ? (
                    <img
                      src={formState.profilePic}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(formState.profilePic)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full max-w-xs mt-2"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                type="text"
                name="location"
                value={formState.location}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="City, Country"
              />
            </div>
            <button className="btn btn-primary w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 