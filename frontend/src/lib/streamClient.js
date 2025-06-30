import { StreamChat } from 'stream-chat';

// Replace with your Stream API key
const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const streamClient = StreamChat.getInstance(apiKey);

export default streamClient;
