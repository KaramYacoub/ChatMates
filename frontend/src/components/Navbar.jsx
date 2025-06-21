import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { logout, getFriendRequests } from "../lib/api";
import toast from "react-hot-toast";
import { Bell, LogOut, ShipWheelIcon, User2 } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

function Navbar() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const queryClient = useQueryClient();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logout successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const notificationCount =
    (friendRequests?.incomingRequests?.length || 0) +
    (friendRequests?.acceptedRequests?.length || 0);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Logo - only visible on Chat page */}
          {isChatPage ? (
            <Link to="/" className="flex items-center gap-2.5">
              <ShipWheelIcon className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                ChatMates
              </span>
            </Link>
          ) : (
            <div />
          )}

          {/* Right Side Items */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/notifications">
              <button className="btn btn-ghost btn-circle relative">
                <Bell className="h-6 w-6 text-base-content opacity-70" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.2em] flex items-center justify-center animate-bounce">
                    {notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <Link to="/profile">
              <button className={`btn btn-ghost btn-circle ${location.pathname === "/profile" ? "btn-active" : ""}`}
                title="Profile"
              >
                <User2 className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <button
              onClick={logoutMutation}
              disabled={isPending}
              className="btn btn-ghost flex items-center gap-2"
            >
              <LogOut className="size-5 text-base-content opacity-70" />
              <span className="hidden sm:inline text-sm">
                {isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
