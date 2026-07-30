import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Extend the Interface to include Mongoose Document properties
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Define the Schema with validations and indexes
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      index: true, // Optimizes lookup queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Prevents password from being returned in queries by default
    },
    status: {
      type: Boolean,
      default: true, // Default to active
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false, // Removes the __v field from documents
  }
);

// 3. Pre-save Hook: Hash password before saving to the database
userSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 4. Instance Method: Safely compare passwords during login
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 5. Export the Model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
