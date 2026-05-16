import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
const categories = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "video", label: "Video" },
  { value: "music", label: "Music" },
  { value: "data", label: "Data" },
  { value: "other", label: "Other" },
];
const GigCard = ({ gig }) => {
  return (
    <Link to={`/gigs/${gig._id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
        <div className="h-48 bg-gray-100 overflow-hidden">
          {gig.images?.[0] ? (
            <img
              src={gig.images[0]}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center 
            text-white text-xs font-medium">
              {gig.seller?.fullName?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{gig.seller?.username}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-3">
            {gig.title}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-medium text-gray-700">
              {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : "New"}
            </span>
            {gig.totalReviews > 0 && (
              <span className="text-sm text-gray-400">({gig.totalReviews} reviews)</span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-400">Starting at</span>
            <p className="text-base font-bold text-gray-900">
              ${gig.packages?.basic?.price}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading } = useQuery({
    queryKey: ["gigs", category, currentSearch, page],
    queryFn: () => api.get("/gigs", {
          params: {
            category,
            search: currentSearch,
            page,
            limit: 12,
          },
        }).then((res) => res.data),
  });
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search, page: 1 });
  };
  const handleCategory = (cat) => {
    setSearchParams({ category: cat, page: 1 });
  };

  const handlePage = (newPage) => {
    setSearchParams({ category, search: currentSearch, page: newPage });
  };

  return (
    <div>
      <div className="bg-emerald-500 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Find the perfect freelance service
          </h1>
          <p className="text-emerald-100 mb-8">
            Thousands of professionals ready to help you
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Try "React developer" or "Logo design"'
              className="flex-1 px-5 py-3 rounded-lg text-gray-900 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
          <button
            onClick={() => setSearchParams({})}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${
              !category
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-emerald-500"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${
                category === cat.value
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-emerald-500"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {data?.gigs?.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No gigs found. Try a different search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.gigs?.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))}
              </div>
            )}

            {data?.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(data.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium border transition ${
                      page === i + 1
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-600 border-gray-300 hover:border-emerald-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;