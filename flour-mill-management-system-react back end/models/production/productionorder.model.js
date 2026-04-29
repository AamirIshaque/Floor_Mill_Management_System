import mongoose from 'mongoose';

const productionOrderSchema = new mongoose.Schema({
  orderNo: { type: String, required: true, unique: true },
  orderDate: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  
  // Input materials (wheat)
  inputItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    uom: { type: String, default: 'Bag' }
  }],
  
  // Output products (flour, bran, etc.)
  outputItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    expectedQty: { type: Number, required: true },
    actualQty: { type: Number, default: 0 },
    uom: { type: String, default: 'Bag' }
  }],
  
  // Production details
  batchNo: { type: String },
  millOperator: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  
  // Quality parameters
  moistureContent: { type: Number }, // percentage
  extractionRate: { type: Number }, // percentage (output/input)
  
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const ProductionOrder = mongoose.model('ProductionOrder', productionOrderSchema);
export default ProductionOrder;
