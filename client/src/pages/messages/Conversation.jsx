import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

let socket;

const Conversation = () => {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      api
        .get(`/messages/conversations/${conversationId}`)
        .then((res) => res.data),
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (text) =>
      api.post(`/messages/conversations/${conversationId}`, { text }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["messages", conversationId]);
      socket.emit("sendMessage", {
        ...res.data.message,
        conversationId,
      });
      setText("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send message");
    },
  });

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.emit("userOnline", user?._id);
    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (message) => {
      if (message.sender?._id !== user?._id) {
        queryClient.invalidateQueries(["messages", conversationId]);
      }
    });

    socket.on("userTyping", () => setIsTyping(true));
    socket.on("userStoppedTyping", () => setIsTyping(false));

    return () => {
      socket.emit("leaveConversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", { conversationId, userId: user?._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit("stopTyping", { conversationId });
      }, 1500)
    );
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    socket.emit("stopTyping", { conversationId });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-10 bg-gray-200 rounded-xl w-2/3 ${
              i % 2 === 0 ? "ml-auto" : ""
            }`}
          />
        ))}
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/messages")}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {msg.sender?.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    isOwn
                      ? "bg-emerald-500 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
              ?
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-end gap-3 pt-4 border-t border-gray-200">
        <textarea
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message... (Enter to send)"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Conversation;