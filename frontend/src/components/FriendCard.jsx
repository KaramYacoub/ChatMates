import { Link } from "react-router";
import { getLanguageFlag } from "../lib/utils";

function FriendCard({ friend }) {
  const nativeFlagUrl = getLanguageFlag(friend.nativeLanguage);
  const learningFlagUrl = getLanguageFlag(friend.learningLanguage);

  return (
    <div className="card bg-base-200 hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex justify-start gap-2.5 mb-3">
          <span className="badge badge-secondary text-xs h-fit">
            {nativeFlagUrl && (
              <img
                src={nativeFlagUrl}
                alt={`${friend.nativeLanguage} flag`}
                className="mr-1 inline-block"
              />
            )}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs h-fit">
            {learningFlagUrl && (
              <img
                src={learningFlagUrl}
                alt={`${friend.learningLanguage} flag`}
                className="mr-1 inline-block"
              />
            )}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
}

export default FriendCard;
