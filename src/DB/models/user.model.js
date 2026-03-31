import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    profileImage: {
      type: String,
      default: null,
    },

    phoneNumber: {
  type: String,
  default: null,
},

    instructorRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

        instructorRequestData: {
      fullName: { type: String },
      idImage: { type: String }, // هيتخزن مسار الصورة
    },
    rejectionReason: {
  type: String,
  default: null,
},

    isActive: {
      type: Boolean,
      default: true,
    },

    isConfirmed: {
      type: Boolean,
      default: false,
    },

    confirmEmailOTP: String,
    confirmEmailExpires: Date,

    resetPasswordOTP: String,
    resetPasswordExpires: Date,

    lastSeen: {
      type: Date,
    },

    // ✅ Refresh tokens array
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* =========================
   🔥 INDEXES (محسّنة)
   ========================= */

// موجود بالفعل بسبب unique
// userSchema.index({ email: 1 }); ❌ مش محتاجه تكتبها

userSchema.index({ role: 1 });               // فلترة حسب الدور
userSchema.index({ isActive: 1 });           // المستخدمين النشطين
userSchema.index({ role: 1, isActive: 1 });  // 🔥 مهم جداً للـ queries المركبة
userSchema.index({ createdAt: -1 });         // sorting (الأحدث أولاً)

// 🔥 Index إضافي مهم (اختياري لكن قوي)
userSchema.index({ instructorRequestStatus: 1 });

const UserModel = model("User", userSchema);

export default UserModel;