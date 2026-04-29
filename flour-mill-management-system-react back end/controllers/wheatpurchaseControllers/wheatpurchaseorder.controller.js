import WheatPurchaseOrder from "../../models/wheatpurchaseModels/wheatpurchaseorder.model.js";

export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, orderDate, deliveryDate, items, totals } = req.body;

    // Calculate item totals
    const orderitems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    const newOrder = new WheatPurchaseOrder({
      supplier,
      orderDate,
      deliveryDate,
      items: orderitems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      grandTotal: totals.grandTotal
    });

    await newOrder.save();
    res.status(201).json({ message: "Purchase Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(400).json({ message: "Failed to create purchase order", error: error.message });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await WheatPurchaseOrder.find()
      .populate("supplier", "supplierName phone")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await WheatPurchaseOrder.findById(req.params.id).populate("supplier");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

