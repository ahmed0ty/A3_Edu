export const authorize = (...roles) => {
  return (req, res, next) => {
    // ✅ تأكد إن المستخدم موجود
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Please login first"
      });
    }

    // ✅ تأكد من الصلاحيات
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Access denied"
      });
    }

    next();
  };
};