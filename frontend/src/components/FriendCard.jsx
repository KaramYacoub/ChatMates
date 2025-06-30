import { Link } from "react-router";
import { getLanguageFlag } from "../lib/utils";

function FriendCard({ friend, isOnline }) {
  const nativeFlagUrl = getLanguageFlag(friend.nativeLanguage);
  const learningFlagUrl = getLanguageFlag(friend.learningLanguage);

  return (
    <div className="rounded-xl bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-200 p-0.5">
      <div className="flex flex-col items-center p-5 gap-3">
        <div className="avatar size-16 mb-2 relative">
          <img
            src={friend.profilePic}
            alt={friend.fullName}
            className="rounded-full object-cover w-16 h-16 border border-base-300"
          />
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            } border-white`}
          />
        </div>
        <h3 className="font-semibold text-base text-center text-base-content mb-1 truncate w-full">
          {friend.fullName}
        </h3>
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          <span className="badge bg-primary text-primary-content badge-outline text-xs flex items-center gap-1 px-2 py-1 border-base-300">
            {nativeFlagUrl && (
              <img
                src={nativeFlagUrl}
                alt={`${friend.nativeLanguage} flag`}
                className="h-3 mr-1"
              />
            )}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs flex items-center gap-1 px-2 py-1 border-base-300">
            {learningFlagUrl && (
              <img
                src={learningFlagUrl}
                alt={`${friend.learningLanguage} flag`}
                className="h-3 mr-1"
              />
            )}
            Learning: {friend.learningLanguage}
          </span>
        </div>
        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-neutral w-full rounded-lg mt-2 hover:shadow-md transition"
        >
          Message
        </Link>
      </div>
    </div>
  );
}

export default FriendCard;
