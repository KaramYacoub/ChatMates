import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlus, UsersIcon } from "lucide-react";

import { capitialize, getLanguageFlag } from "../lib/utils";

import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";

import { useOnlineStatus } from "../hooks/useOnlineStatus";

function HomePage() {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  // Get Your Friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Get Recommended Users
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  // Get Outgoing Friend Requests
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // Send Friend Request
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent successfully");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  // Update outgoingRequestsIds
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const recommendedUserIds = recommendedUsers.map((user) => user._id);
  const friendUserIds = friends.map((friend) => friend._id);
  const onlineStatus = useOnlineStatus([
    ...recommendedUserIds,
    ...friendUserIds,
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch justify-center">
            {friends.map((friend) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                isOnline={onlineStatus[friend._id]}
              />
            ))}
          </div>
        )}

        {/* Recommended Users */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>

          {/* Loading Recommended Users */}
          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            // map throw recommended users
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {recommendedUsers.map((user) => {
                // check if request has been sent
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div key={user._id} className="h-full flex">
                    <div className="rounded-xl bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-200 p-0.5 flex flex-col justify-center items-center w-full h-full">
                      <div className="flex flex-col items-center p-5 gap-3 w-full h-full justify-center">
                        {/* Avatar Row */}
                        <div className="avatar size-16 mb-2 flex-shrink-0">
                          <img
                            src={user.profilePic}
                            alt={user.fullName}
                            className="rounded-full object-cover w-16 h-16 border border-base-300"
                          />
                        </div>
                        {/* Name Row */}
                        <div className="w-full flex flex-col items-center">
                          <h3 className="font-semibold text-base text-center text-base-content mb-0 truncate w-full">
                            {user.fullName}
                          </h3>
                        </div>
                        {/* Location Row */}
                        {user.location && (
                          <div className="flex items-center text-xs opacity-70 mb-0 w-full justify-center">
                            <MapPinIcon className="size-3 mr-1" />
                            {user.location}
                          </div>
                        )}
                        {/* Languages Row */}
                        <div className="flex flex-col items-center gap-2 w-full mb-0">
                          <span className="badge bg-primary text-primary-content badge-outline text-xs flex items-center gap-1 px-2 py-1 border-base-300">
                            {getLanguageFlag(user.nativeLanguage) && (
                              <img
                                src={getLanguageFlag(user.nativeLanguage)}
                                alt={`${user.nativeLanguage} flag`}
                                className="h-3 mr-1"
                              />
                            )}
                            Native: {capitialize(user.nativeLanguage)}
                          </span>
                          <span className="badge badge-outline text-xs flex items-center gap-1 px-2 py-1 border-base-300">
                            {getLanguageFlag(user.learningLanguage) && (
                              <img
                                src={getLanguageFlag(user.learningLanguage)}
                                alt={`${user.learningLanguage} flag`}
                                className="h-3 mr-1"
                              />
                            )}
                            Learning: {capitialize(user.learningLanguage)}
                          </span>
                        </div>
                        {/* Bio Row */}
                        {user.bio && (
                          <div className="w-full flex flex-col items-center">
                            <p className="text-sm opacity-70 text-center mb-0">
                              {user.bio}
                            </p>
                          </div>
                        )}
                        {/* Button Row */}
                        <div className="w-full flex flex-col items-center">
                          <button
                            className={`btn btn-neutral w-full rounded-lg mt-2 hover:shadow-md transition ${
                              hasRequestBeenSent ? "btn-disabled" : ""
                            }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" />
                                Request Sent
                              </>
                            ) : isPending ? (
                              <div className="flex items-center gap-2">
                                <div className="loading loading-spinner loading-sm"></div>
                                <span>Sending...</span>
                              </div>
                            ) : (
                              <>
                                <UserPlus className="size-4 mr-2" /> Send Friend
                                Request
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
