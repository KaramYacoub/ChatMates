import { useEffect, useState, useRef } from "react";
import { useChatContext } from "stream-chat-react";
import { debounce } from "lodash";

export function useOnlineStatus(userIds) {
  const { client } = useChatContext();
  const [onlineUsers, setOnlineUsers] = useState({});
  const statusCache = useRef({});
  const debouncedQuery = useRef(null);

  // Only initialize once
  if (!debouncedQuery.current) {
    debouncedQuery.current = debounce(async (ids) => {
      try {
        const response = await client.queryUsers(
          { id: { $in: ids } },
          {},
          { presence: true }
        );

        const newStatus = {};
        let hasChanges = false;

        response.users.forEach((user) => {
          newStatus[user.id] = user.online;
          if (statusCache.current[user.id] !== user.online) {
            hasChanges = true;
            statusCache.current[user.id] = user.online;
          }
        });

        // Only update state if changes occurred
        if (hasChanges) {
          setOnlineUsers((prev) => ({ ...prev, ...newStatus }));
        }
      } catch (err) {
        console.warn("Failed to fetch user status:", err.message);
      }
    }, 1000);
  }

  useEffect(() => {
    if (!Array.isArray(userIds) || userIds.length === 0 || !client.userID)
      return;

    const idsToCheck = [...userIds];
    const unknownIds = idsToCheck.filter((id) => !(id in statusCache.current));

    if (unknownIds.length > 0) {
      debouncedQuery.current(unknownIds);
    }

    // Set only if known statuses have changed
    const knownStatus = {};
    let hasChanges = false;

    idsToCheck.forEach((id) => {
      const known = statusCache.current[id];
      if (known !== undefined) {
        knownStatus[id] = known;
        if (onlineUsers[id] !== known) {
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setOnlineUsers((prev) => ({ ...prev, ...knownStatus }));
    }

    const currentDebounced = debouncedQuery.current;
    return () => {
      currentDebounced.cancel();
    };
  }, [client.userID, onlineUsers, userIds]);

  return onlineUsers;
}
