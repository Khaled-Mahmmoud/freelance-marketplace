import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  skills: z.string().optional(),
});

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (data?.user) {
      reset({
        fullName: data.user.fullName,
        bio: data.user.bio,
        skills: data.user.skills?.join(", "),
      });
    }
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => api.put("/users/profile", payload),
    onSuccess: (res) => {
      setUser(res.data.user);
      queryClient.invalidateQueries(["me"]);
      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const onSubmit = (data) => {
    mutate({
      fullName: data.fullName,
      bio: data.bio,
      skills: data.skills
        ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const profile = data?.user;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {profile?.fullName}
            </h2>
            <p className="text-gray-500 text-sm">@{profile?.username}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${
                profile?.role === "freelancer"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {profile?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl text-center">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {profile?.totalOrders || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Orders</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              ${profile?.earnings || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Earnings</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {profile?.isVerified ? "✓" : "✗"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Verified</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-6">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Full Name
            </label>
            <input
              {...register("fullName")}
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Bio
            </label>
            <textarea
              {...register("bio")}
              rows={4}
              placeholder="Tell clients about yourself..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            {errors.bio && (
              <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
            )}
          </div>

          {profile?.role === "freelancer" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Skills
              </label>
              <input
                {...register("skills")}
                type="text"
                placeholder="React, Node.js, MongoDB (comma separated)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Separate skills with commas
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile?.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Username
            </label>
            <input
              type="text"
              value={profile?.username}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Username cannot be changed
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;