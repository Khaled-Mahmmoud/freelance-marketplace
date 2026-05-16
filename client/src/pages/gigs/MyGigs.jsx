import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const MyGigs = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      api.get("/gigs", { params: { seller: true } }).then((res) => res.data),
  });
  const { mutate: deleteGig } = useMutation({
    mutationFn: (id) => api.delete(`/gigs/${id}`),
    onSuccess: () => {
      toast.success("Gig deleted successfully");
      queryClient.invalidateQueries(["myGigs"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete gig");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this gig?")) {
      deleteGig(id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Gigs</h1>
        <Link
          to="/gigs/create"
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
        >
          + New Gig
        </Link>
      </div>

      {data?.gigs?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">You have no gigs yet.</p>
          <Link
            to="/gigs/create"
            className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
          >
            Create your first gig
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.gigs?.map((gig) => (
            <div
              key={gig._id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5"
            >
              <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {gig.images?.[0] ? (
                  <img
                    src={gig.images[0]}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {gig.title}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>★ {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : "New"}</span>
                  <span>{gig.totalOrders} orders</span>
                  <span>{gig.impressions} impressions</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      gig.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {gig.isActive ? "Active" : "Paused"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-gray-900">
                  ${gig.packages?.basic?.price}
                </span>
                <Link
                  to={`/gigs/${gig._id}`}
                  className="text-sm text-emerald-500 hover:underline px-3 py-1.5 border border-emerald-500 rounded-lg"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(gig._id)}
                  className="text-sm text-red-500 hover:underline px-3 py-1.5 border border-red-300 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;