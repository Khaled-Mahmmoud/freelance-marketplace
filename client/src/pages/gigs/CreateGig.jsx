import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axios";

const gigSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().min(1, "Please add at least one tag"),
  requirements: z.string().optional(),
  basicDescription: z.string().min(1, "Basic package description is required"),
  basicPrice: z.coerce.number().min(5, "Minimum price is $5"),
  basicDeliveryDays: z.coerce.number().min(1, "Minimum 1 day"),
  basicRevisions: z.coerce.number().min(0),
  standardDescription: z.string().optional(),
  standardPrice: z.coerce.number().optional(),
  standardDeliveryDays: z.coerce.number().optional(),
  standardRevisions: z.coerce.number().optional(),
  premiumDescription: z.string().optional(),
  premiumPrice: z.coerce.number().optional(),
  premiumDeliveryDays: z.coerce.number().optional(),
  premiumRevisions: z.coerce.number().optional(),
});

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

const CreateGig = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      basicRevisions: 1,
      standardRevisions: 2,
      premiumRevisions: 3,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post("/gigs", data),
    onSuccess: () => {
      toast.success("Gig created successfully!");
      navigate("/my-gigs");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create gig");
    },
  });

  const onSubmit = (data) => {
    const gigData = {
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      requirements: data.requirements,
      packages: {
        basic: {
          description: data.basicDescription,
          price: data.basicPrice,
          deliveryDays: data.basicDeliveryDays,
          revisions: data.basicRevisions,
        },
        ...(data.standardPrice && {
          standard: {
            description: data.standardDescription,
            price: data.standardPrice,
            deliveryDays: data.standardDeliveryDays,
            revisions: data.standardRevisions,
          },
        }),
        ...(data.premiumPrice && {
          premium: {
            description: data.premiumDescription,
            price: data.premiumPrice,
            deliveryDays: data.premiumDeliveryDays,
            revisions: data.premiumRevisions,
          },
        }),
      },
    };
    mutate(gigData);
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const PackageSection = ({ prefix, label, required }) => (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-800 mb-4">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Description
          </label>
          <input
            {...register(`${prefix}Description`)}
            type="text"
            placeholder="What's included in this package"
            className={inputClass}
          />
          {errors[`${prefix}Description`] && (
            <p className="text-red-500 text-xs mt-1">
              {errors[`${prefix}Description`].message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Price ($)
            </label>
            <input
              {...register(`${prefix}Price`)}
              type="number"
              placeholder="50"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Delivery (days)
            </label>
            <input
              {...register(`${prefix}DeliveryDays`)}
              type="number"
              placeholder="3"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Revisions
            </label>
            <input
              {...register(`${prefix}Revisions`)}
              type="number"
              placeholder="1"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create a New Gig</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 text-lg">Overview</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Gig Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="I will build a professional React website for you"
              className={inputClass}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select {...register("category")} className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={6}
              placeholder="Describe your gig in detail..."
              className={inputClass}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              {...register("tags")}
              type="text"
              placeholder="react, nodejs, mongodb (comma separated)"
              className={inputClass}
            />
            {errors.tags && (
              <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Requirements
            </label>
            <textarea
              {...register("requirements")}
              rows={3}
              placeholder="What do you need from the buyer to get started?"
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg">Packages</h2>
          <PackageSection prefix="basic" label="Basic" required />
          <PackageSection prefix="standard" label="Standard" />
          <PackageSection prefix="premium" label="Premium" />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-500 text-white py-3 rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Gig"}
        </button>
      </form>
    </div>
  );
};

export default CreateGig;