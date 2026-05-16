const Gig = require("../models/gig.model");
const ApiError = require("../utils/ApiError");
const createGig = async (req, res, next) => {
    try {
        if (req.user.role !== "freelancer") {
            throw new ApiError(403, "Only freelancers can create gigs");
        }
        const gig = await Gig.create({
            ...req.body,
            seller: req.user._id,
        });
        res.status(201).json({ success: true, gig });
    } catch (error) {
        next(error);
    }
};

const getAllGigs = async (req, res, next) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10,
        } = req.query;
        const query = { isActive: true };
        if (category) query.category = category;
        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query["packages.basic.price"] = {};
            if (minPrice) query["packages.basic.price"].$gte = Number(minPrice);
            if (maxPrice) query["packages.basic.price"].$lte = Number(maxPrice);
        }
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            rating: { averageRating: -1 },
            popular: { totalOrders: -1 },
        };
        const sortBy = sortOptions[sort] || sortOptions.newest;
        const skip = (page - 1) * limit;

        const total = await Gig.countDocuments(query);

        const gigs = await Gig.find(query)
            .populate("seller", "username fullName avatar")
            .sort(sortBy)
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            gigs,
        });
    } catch (error) {
        next(error);
    }
};
const getGigById = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id).populate("seller","username fullName avatar bio");
        if (!gig) throw new ApiError(404, "Gig not found");
        gig.impressions += 1; 
        await gig.save();
        res.status(200).json({ success: true, gig });
    } catch (error) {
        next(error);
    }
};
const updateGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) throw new ApiError(404, "Gig not found");
        if (gig.seller.toString() !== req.user._id.toString()) { // MongoDB IDs are objects not strings
            throw new ApiError(403, "You can only update your own gigs");
        }
        const updatedGig = await Gig.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, gig: updatedGig });
    } catch (error) {
        next(error);
    }
};
const deleteGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            throw new ApiError(404, "Gig not found");
        }

        if (gig.seller.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can only delete your own gigs");
        }

        await Gig.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Gig deleted successfully" });
    } catch (error) {
        next(error);
    }
};
module.exports = { createGig, getAllGigs, getGigById, updateGig, deleteGig };
