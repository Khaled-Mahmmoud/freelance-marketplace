import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  disputed: "bg-orange-100 text-orange-700",
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get(`/orders/${id}`).then((res) => res.data),
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (payload) => api.put(`/orders/${id}/status`, payload),
    onSuccess: () => {
      toast.success("Order updated successfully");
      queryClient.invalidateQueries(["order", id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order");
    },
  });

  const { mutate: submitReview, isPending: isReviewing } = useMutation({
    mutationFn: () =>
      api.post("/reviews", { orderId: id, rating, comment }),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      queryClient.invalidateQueries(["order", id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const order = data?.order;

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-400">Order not found.</div>
    );
  }

  const isBuyer = user?._id === order.buyer?._id;
  const isSeller = user?._id === order.seller?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            statusColors[order.status]
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Gig</h2>
          <p className="text-gray-900 font-medium">{order.gig?.title}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="capitalize">{order.package} package</span>
            <span>•</span>
            <span>${order.price}</span>
            <span>•</span>
            <span>{order.deliveryDays} days delivery</span>
            <span>•</span>
            <span>{order.revisions} revisions</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Parties</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Buyer</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                  {order.buyer?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.buyer?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    @{order.buyer?.username}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Seller</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {order.seller?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.seller?.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    @{order.seller?.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {order.requirements && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-2">Requirements</h2>
            <p className="text-gray-600 text-sm">{order.requirements}</p>
          </div>
        )}

        {order.deliveryMessage && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <h2 className="font-semibold text-purple-800 mb-2">
              Delivery Message
            </h2>
            <p className="text-purple-700 text-sm">{order.deliveryMessage}</p>
          </div>
        )}

        {order.dueDate && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-2">Due Date</h2>
            <p className="text-gray-600 text-sm">
              {new Date(order.dueDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {isSeller && order.status === "pending" && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Accept or Decline
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus({ status: "active" })}
                disabled={isPending}
                className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
              >
                Accept Order
              </button>
              <button
                onClick={() => {
                  const reason = window.prompt("Reason for cancellation:");
                  if (reason) updateStatus({ status: "cancelled", cancelReason: reason });
                }}
                disabled={isPending}
                className="flex-1 border border-red-300 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                Decline Order
              </button>
            </div>
          </div>
        )}

        {isSeller && order.status === "active" && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Deliver Order
            </h2>
            <textarea
              value={deliveryMessage}
              onChange={(e) => setDeliveryMessage(e.target.value)}
              rows={4}
              placeholder="Describe what you have delivered..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3"
            />
            <button
              onClick={() =>
                updateStatus({ status: "delivered", deliveryMessage })
              }
              disabled={isPending || !deliveryMessage.trim()}
              className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              Mark as Delivered
            </button>
          </div>
        )}

        {isBuyer && order.status === "delivered" && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Review Delivery
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus({ status: "completed" })}
                disabled={isPending}
                className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
              >
                Accept Delivery
              </button>
              <button
                onClick={() => updateStatus({ status: "disputed" })}
                disabled={isPending}
                className="flex-1 border border-orange-300 text-orange-500 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-50 transition disabled:opacity-50"
              >
                Raise Dispute
              </button>
            </div>
          </div>
        )}

        {isBuyer && order.status === "completed" && !order.isReviewed && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">
              Leave a Review
            </h2>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3"
            />
            <button
              onClick={() => submitReview()}
              disabled={isReviewing || !comment.trim()}
              className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {isReviewing ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {isBuyer && order.status === "completed" && order.isReviewed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <p className="text-emerald-700 font-medium">
              ✓ You have reviewed this order
            </p>
          </div>
        )}

        {(isBuyer || isSeller) &&
          ["pending", "active"].includes(order.status) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 mb-4">
                Cancel Order
              </h2>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Reason for cancellation..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-3"
              />
              <button
                onClick={() =>
                  updateStatus({ status: "cancelled", cancelReason })
                }
                disabled={isPending || !cancelReason.trim()}
                className="w-full border border-red-300 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default OrderDetails;