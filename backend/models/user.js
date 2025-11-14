const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    image: { type: String, default: "default-avatar.png" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },

    // Préférences alimentaires 
    preferences: {
      regime: [
        {
          type: String,
          enum: [
            "omnivore",
            "végétarien",
            "keto",
            "autre",
          ],
        },
      ],
      objectifs: [
        {
          type: String,
          enum: [
            "perte de poids",
            "prise de masse",
            "santé équilibrée",
            "autre",
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
