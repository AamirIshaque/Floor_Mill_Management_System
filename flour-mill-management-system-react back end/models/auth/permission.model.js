import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true,
    enum: ['admin', 'manager', 'operator', 'user']
  },
  path: { type: String, required: true },
  hasAccess: { type: Boolean, default: false }
}, { timestamps: true });

// Compound unique index
permissionSchema.index({ role: 1, path: 1 }, { unique: true });

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
