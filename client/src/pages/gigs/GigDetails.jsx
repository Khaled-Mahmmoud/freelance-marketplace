import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [requirements, setRequirements] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => api.get(`/gigs/${id}`).then((res) => res.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get(`/reviews/${id}`).then((res) => res.data),
  });

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      api.post(`/orders/${id}`, { package: selectedPackage, requirements }),
    onSuccess: () => {
      toast.success("Order placed successfully!");
      navigate("/orders");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to place order");
    },
  });

  const handleOrder = () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    if (user?.role !== "client") {
      toast.error("Only clients can place orders");
      return;
    }
    if (!requirements.trim()) {
      toast.error("Please provide your requirements");
      return;
    }
    placeOrder();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-64 bg-gray-200 rounded mb-4" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  const gig = data?.gig;

  if (!gig) {
    return (
      <div className="text-center py-20 text-gray-400">Gig not found.</div>
    );
  }

  const packageData = gig.packages[selectedPackage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{gig.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
              {gig.seller?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{gig.seller?.fullName}</p>
              <p className="text-sm text-gray-500">@{gig.seller?.username}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium text-gray-700">
                {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : "New"}
              </span>
              {gig.totalReviews > 0 && (
                <span className="text-gray-400 text-sm">
                  ({gig.totalReviews} reviews)
                </span>
              )}
            </div>
          </div>

          {gig.images?.length > 0 && (
            <div className="rounded-xl overflow-hidden mb-6">
              <img
                src={gig.images[0]}
                alt={gig.title}
                className="w-full object-cover max-h-96"
              />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About this gig
            </h2>
            <p className="text-gray-600 leading-relaxed">{gig.description}</p>
          </div>

          {gig.tags?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reviews ({gig.totalReviews})
            </h2>
            {reviewsData?.reviews?.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviewsData?.reviews?.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                        {review.reviewer?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.reviewer?.fullName}
                        </p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < review.rating
                                  ? "text-yellow-400 text-xs"
                                  : "text-gray-300 text-xs"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-2xl overflow-hidden sticky top-20">
            <div className="flex border-b border-gray-200">
              {["basic", "standard", "premium"].map((pkg) => {
                const pkgData = gig.packages[pkg];
                if (!pkgData?.price) return null;
                return (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition ${
                      selectedPackage === pkg
                        ? "bg-white text-emerald-600 border-b-2 border-emerald-500"
                        : "bg-gray-50 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {pkg}
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 capitalize">
                  {selectedPackage} Package
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ${packageData?.price}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {packageData?.description}
              </p>

              <div className="space-y-2 mb-5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>{packageData?.deliveryDays} days delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>{packageData?.revisions} revisions</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Your Requirements
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="Describe what you need..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                onClick={handleOrder}
                disabled={isPending}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {isPending ? "Placing order..." : `Order Now — $${packageData?.price}`}
              </button>

              {gig.seller?._id !== user?._id && isAuthenticated && (
                <button
                  onClick={() =>
                    navigate(`/messages?recipientId=${gig.seller?._id}`)
                  }
                  className="w-full mt-2 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:border-emerald-500 hover:text-emerald-500 transition"
                >
                  Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
