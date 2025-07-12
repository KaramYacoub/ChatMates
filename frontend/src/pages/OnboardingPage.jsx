import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";
import { CameraIcon, Loader2, MapPinIcon, ShipWheelIcon } from "lucide-react";
import { LANGUAGES } from "../constants/constants-index";

function OnboardingPage() {
  const { authUser } = useAuthUser();

  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    profilePic: authUser?.profilePic || "",
    location: authUser?.location || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      if (error.response?.data?.missingFields) {
        const missingFields = error.response.data.missingFields.join(", ");
        toast.error(`Please fill in: ${missingFields}`);
      } else {
        toast.error(error.response?.data?.message || "An error occurred");
      }
    },
  });

  const validateForm = () => {
    const requiredFields = {
      fullName: "Full Name",
      bio: "Bio",
      nativeLanguage: "Native Language",
      learningLanguage: "Learning Language",
      location: "Location",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formState[key]?.trim())
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return false;
    }

    // Additional validation to ensure no empty strings or just spaces
    for (const [key, value] of Object.entries(formState)) {
      if (key !== "profilePic" && (!value || value.trim().length === 0)) {
        toast.error(`${requiredFields[key]} cannot be empty`);
        return false;
      }
    }

    return true;
  };

  const handleOnboarding = (e) => {
    e.preventDefault();

    // Trim all text fields before submission
    const trimmedFormState = {
      ...formState,
      fullName: formState.fullName?.trim(),
      bio: formState.bio?.trim(),
      nativeLanguage: formState.nativeLanguage?.trim(),
      learningLanguage: formState.learningLanguage?.trim(),
      location: formState.location?.trim(),
    };

    if (!validateForm()) return;
    onboardingMutation(trimmedFormState);
  };

  // const handleRandomAvatar = () => {
  //   const randomNumber = Math.floor(Math.random() * 100) + 1;
  //   const randomAvatar = `https://avatar.iran.liara.run/public/${randomNumber}.png`;
  //   setFormState({ ...formState, profilePic: randomAvatar });
  // };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormState({ ...formState, profilePic: file });
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleOnboarding} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  typeof formState.profilePic === "string" ? (
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

              {/* Upload Avatar */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full max-w-xs mt-2"
              />
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name *</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio *</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language *</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
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

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language *</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
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

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location *</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <Loader2 className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default OnboardingPage;
