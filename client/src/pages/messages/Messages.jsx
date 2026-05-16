import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const Messages = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("recipientId");

  const { mutate: getOrCreate } = useMutation({
    mutationFn: (recipientId) =>
      api.post("/messages/conversations", { recipientId }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["conversations"]);
      navigate(`/messages/${res.data.conversation._id}`);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  useEffect(() => {
    if (recipientId) {
      getOrCreate(recipientId);
    }
  }, [recipientId]);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      api.get("/messages/conversations").then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>

      {data?.conversations?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No conversations yet.
        </div>
      ) : (
        <div className="space-y-2">
          {data?.conversations?.map((conv) => {
            const other = conv.participants?.find(
              (p) => p._id !== user?._id
            );

            return (
              <div
                key={conv._id}
                onClick={() => navigate(`/messages/${conv._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {other?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{other?.fullName}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(conv.lastMessageAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;