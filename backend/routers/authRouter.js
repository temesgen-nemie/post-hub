const express = require("express");
const authController = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", identifier, authController.signout);

router.patch(
  "/send-verification-code",

  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code",

  authController.verifyVerificationCode
);
router.patch("/change-password", identifier, authController.changePassword);
router.patch(
  "/send-forgot-password-code",
  authController.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code",
  authController.verifyForgotPasswordCode
);
router.patch("/update-profile", identifier, authController.updateProfile);
router.get("/me", identifier, authController.getMe);
module.exports = router;
