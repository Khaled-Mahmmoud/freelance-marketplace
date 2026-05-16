import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "freelancer"]),
});

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "client" },
  });
  const selectedRole = watch("role");
  
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post("/auth/register", data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success("Account created successfully!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (data) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Join FreelanceHub</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create your account and start today
          </p>
        </div>
    
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                document.querySelector('input[value="client"]').click();
              }}
              className={`py-2 rounded-md text-sm font-medium transition ${
                selectedRole === "client"
                  ? "bg-white shadow text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              I'm a Client
            </button>
            <button
              type="button"
              onClick={() => {
                document.querySelector('input[value="freelancer"]').click();
              }}
              className={`py-2 rounded-md text-sm font-medium transition ${
                selectedRole === "freelancer"
                  ? "bg-white shadow text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              I'm a Freelancer
            </button>
            <input
              {...register("role")}
              type="radio"
              value="client"
              className="hidden"
            />
            <input
              {...register("role")}
              type="radio"
              value="freelancer"
              className="hidden"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Full Name
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Username
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="johndoe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm 
            font-medium hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-500 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;