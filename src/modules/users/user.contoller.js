import UserModel from "../../DB/models/user.model.js";
import * as userService from "./user.service.js";
import { getIO } from "../../../socket.js";

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 5,
      search = "",
      role,
      status,
    } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);

    const query = {};

    if (search.trim()) {
      query.email = { $regex: search.trim(), $options: "i" };
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const users = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserModel.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ================= GET SINGLE USER =================
export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user });

  } catch (error) {
    next(error);
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    const io = getIO();
    io.emit("users:updated");

    res.status(200).json({
      message: "User updated",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);

    const io = getIO();
    io.emit("users:updated");

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

// ================= GET INSTRUCTOR REQUESTS =================
export const getInstructorRequests = async (req, res, next) => {
  try {
    const requests = await UserModel.find({
      instructorRequestStatus: "pending",
    });

    res.status(200).json({ data: requests });

  } catch (error) {
    next(error);
  }
};

// ================= APPROVE INSTRUCTOR =================
export const approveInstructor = async (req, res, next) => {
  try {
    const user = await userService.approveInstructor(req.params.id);

    const io = getIO();

    io.emit("users:updated");

    io.emit("instructorRequest:updated", {
  userId: req.params.id,
  status: "approved",
});

// ✅ ابعت للطالب نفسه
io.to(`user_${req.params.id}`).emit("instructorRequestUpdated", {
  _id: req.params.id,
  instructorRequestStatus: "approved",
});

    res.status(200).json({
      message: "Instructor approved",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};

// ================= REJECT INSTRUCTOR =================
export const rejectInstructor = async (req, res, next) => {
  try {
    const reason = req.body?.reason;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const user = await userService.rejectInstructor(
      req.params.id,
      reason
    );

    const io = getIO();

    io.emit("users:updated");

    io.emit("instructorRequest:updated", {
  userId: req.params.id,
  status: "rejected",
  reason,
});

// ✅ ابعت للطالب نفسه
io.to(`user_${req.params.id}`).emit("instructorRequestUpdated", {
  _id: req.params.id,
  instructorRequestStatus: "rejected",
  rejectionReason: reason,
});

    res.status(200).json({
      message: "Instructor rejected",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};

// ================= TOGGLE ACTIVE =================
export const toggleUserActive = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    const io = getIO();
    io.emit("users:updated");

    res.json({
      message: "User status updated",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= USERS STATS =================
export const getUsersStats = async (req, res, next) => {
  try {
    const stats = await userService.getUsersStats();

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    next(error);
  }
};

// ================= GET MY PROFILE =================
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id)
      .select("-password");

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    next(error);
  }
};

// ================= UPDATE MY PROFILE =================
export const updateMyProfile = async (req, res, next) => {
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    next(error);
  }
};

// ================= CANCEL INSTRUCTOR REQUEST =================
export const cancelInstructorRequest = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await userService.cancelInstructorRequest(req.user._id);

    const io = getIO();

    io.emit("users:updated");

    io.emit("instructorRequest:updated", {
      userId: req.user._id,
      status: "cancelled",
    });

    res.json({
      message: "Request cancelled successfully",
      data: user,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};