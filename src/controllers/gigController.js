import Gig from "../models/Gig.js";

// ==========================================
// ✅ GET ALL OPEN GIGS
// ==========================================
export const getGigs = async (req, res) => {
  console.log("🔍 getGigs handler called");
  try {
    const gigs = await Gig.find({ status: "open" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(gigs);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch gigs",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ GET SINGLE GIG BY ID
// ==========================================
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).lean();

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    return res.status(200).json(gig);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch gig",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ CREATE GIG
// ==========================================
export const createGig = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      isUrgent,
    } = req.body;

    const gig = await Gig.create({
      title,
      description,
      category: category || "General",
      budget: budget || 0,
      isUrgent: isUrgent || false,
      status: "open",
      postedBy: req.user?._id || req.user?.id || null,
    });

    return res.status(201).json(gig);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create gig",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ UPDATE GIG
// ==========================================
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    return res.status(200).json(gig);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update gig",
      error: error.message,
    });
  }
};

// ==========================================
// ✅ ARCHIVE GIG (Soft Delete)
// ==========================================
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    return res.status(200).json({
      message: "Gig archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete gig",
      error: error.message,
    });
  }
};