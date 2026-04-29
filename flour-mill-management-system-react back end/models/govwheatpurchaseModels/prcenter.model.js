import mongoose from "mongoose";

const prCenterSchema = new mongoose.Schema({
  centerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  centerName: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  storageCapacity: {
    type: Number,
    min: 0,
  },
  location: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const PRCenter = mongoose.model("PRCenter", prCenterSchema);
export default PRCenter;
