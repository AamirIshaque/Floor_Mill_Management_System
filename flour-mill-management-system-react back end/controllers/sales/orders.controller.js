import SalesOrder from "../../models/sales/salesorder.model.js";

export const createOrder = async (req, res) => {
  try {
    const { customer, orderDate, items, totals } = req.body;

    // Generate incremental order number
    const existingOrders = await SalesOrder.find({ orderNo: { $regex: /^SO-/ } })
      .select('orderNo')
      .sort({ orderNo: -1 })
      .limit(1);

    let nextOrderNumber = 'SO-0001';
    if (existingOrders.length > 0 && existingOrders[0].orderNo) {
      const lastOrderNo = existingOrders[0].orderNo;
      const match = lastOrderNo.match(/SO-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextOrderNumber = `SO-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const orderItems = (items || []).map(i => ({ ...i, amount: i.qty * i.rate }));
    const doc = await SalesOrder.create({
      orderNo: nextOrderNumber,
      customer,
      orderDate,
      items: orderItems,
      subtotal: totals?.subtotal ?? orderItems.reduce((a, b) => a + b.amount, 0),
      tax: totals?.tax ?? 0,
      grandTotal: totals?.grandTotal ?? orderItems.reduce((a, b) => a + b.amount, 0),
      status: "Confirmed",
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create sales order", error: err.message });
  }
};

export const listOrders = async (_req, res) => {
  try {
    const docs = await SalesOrder.find()
      .populate("customer", "name phone")
      .populate("items.product", "productName productCode")
      .populate("invoice", "invoiceNo invoiceDate")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales orders", error: err.message });
  }
};
