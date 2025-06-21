import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import { User2, VideoIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CustomChatHeader = ({ channel, onVideoCall }) => {
  const members = Object.values(channel.state.members || {});
  const currentUserId = channel?.client?.user?.id;
  let otherUser = null;
  if (currentUserId) {
    otherUser = members.find(
      (m) => m.user && m.user.id !== currentUserId
    )?.user;
  }

  return (
    <div className="flex items-center justify-between bg-green-100 px-4 py-2 border-b border-green-200">
      <div className="flex items-center gap-3">
        {otherUser?.image ? (
          <img
            src={otherUser.image}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-300 flex items-center justify-center">
            <User2 className="text-white" />
          </div>
        )}
        <div>
          <div className="font-semibold text-base text-green-900">{otherUser?.name || "User"}</div>
          <div className="text-xs text-green-700">Online</div>
        </div>
      </div>
      <button
        onClick={onVideoCall}
        className="btn btn-success btn-sm flex items-center gap-2"
        title="Start Video Call"
      >
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error.message);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] bg-green-50 flex flex-col">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col">
            <CustomChatHeader channel={channel} onVideoCall={handleVideoCall} />
            <div className="flex-1 overflow-y-auto">
              <Window>
                <MessageList />
                <MessageInput focus />
              </Window>
            </div>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
