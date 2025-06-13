import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";
import { Bell, LogOut, ShipWheelIcon } from "lucide-react";
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
              <button className="btn btn-ghost btn-circle">
                <Bell className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
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
