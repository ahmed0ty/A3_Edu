import UserModel from "../../DB/models/user.model.js";
import bcrypt from "bcrypt";

// ================= GET ALL USERS =================
export const getAllUsers = async () => {
  return await UserModel.find().select("-password");
};

// ================= GET USER BY ID =================
export const getUserById = async (userId) => {
  return await UserModel.findById(userId).select("-password");
};

// ================= UPDATE USER =================
export const updateUser = async (userId, data) => {
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  return await UserModel.findByIdAndUpdate(userId, data, {
    new: true,
  }).select("-password");
};

// ================= DELETE USER =================
export const deleteUser = async (userId) => {
  return await UserModel.findByIdAndDelete(userId);
};

// ================= GET INSTRUCTOR REQUESTS =================
export const getInstructorRequests = async () => {
  return await UserModel.find({
    instructorRequestStatus: "pending",
  }).select("-password");
};

// ================= APPROVE INSTRUCTOR =================
export const approveInstructor = async (userId) => {
  return await UserModel.findByIdAndUpdate(
    userId,
    {
      role: "instructor",
      instructorRequestStatus: "approved",
    },
    { new: true }
  ).select("-password");
};

// ================= REJECT INSTRUCTOR =================
export const rejectInstructor = async (userId, reason) => {
  return await UserModel.findByIdAndUpdate(
    userId,
    {
      instructorRequestStatus: "rejected",
      rejectionReason: reason,
    },
    { new: true }
  ).select("-password");
};

// ================= USERS STATS =================
export const getUsersStats = async () => {
  const stats = await UserModel.aggregate([
    {
      $group: {
        _id: null,

        total: { $sum: 1 },

        active: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },

        inactive: {
          $sum: {
            $cond: [{ $eq: ["$isActive", false] }, 1, 0],
          },
        },

        students: {
          $sum: {
            $cond: [{ $eq: ["$role", "student"] }, 1, 0],
          },
        },

        instructors: {
          $sum: {
            $cond: [{ $eq: ["$role", "instructor"] }, 1, 0],
          },
        },

        admins: {
          $sum: {
            $cond: [{ $eq: ["$role", "admin"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      students: 0,
      instructors: 0,
      admins: 0,
    }
  );
};

// ================= CANCEL INSTRUCTOR REQUEST =================
export const cancelInstructorRequest = async (userId) => {
  return await UserModel.findByIdAndUpdate(
    userId,
    {
      instructorRequestStatus: "none",
      rejectionReason: null,
    },
    { new: true }
  ).select("-password");
};