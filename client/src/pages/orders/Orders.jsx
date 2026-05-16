import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

const Orders = () => {
  const { user } = useAuthStore();
  const [isSeller, setIsSeller] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", isSeller],
    queryFn: () =>
      api
        .get("/orders", { params: { seller: isSeller } })
        .then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        {user?.role === "freelancer" && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsSeller(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                !isSeller
                  ? "bg-white shadow text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              Buying
            </button>
            <button
              onClick={() => setIsSeller(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                isSeller
                  ? "bg-white shadow text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              Selling
            </button>
          </div>
        )}
      </div>

      {data?.orders?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {data?.orders?.map((order) => (
            <Link to={`/orders/${order._id}`} key={order._id}>
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {order.gig?.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="capitalize">{order.package} package</span>
                      <span>•</span>
                      <span>
                        {isSeller
                          ? `Buyer: ${order.buyer?.fullName}`
                          : `Seller: ${order.seller?.fullName}`}
                      </span>
                    </div>
                    {order.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due:{" "}
                        {new Date(order.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-gray-900">
                      ${order.price}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default Orders;
