import bcrypt from "bcrypt";
import User from "../models/auth/user.model.js";
import Product from "../models/product/product.model.js";
import StockTxn from "../models/stock/stocktxn.model.js";

/**
 * Seeds the database with an initial admin user if one does not exist.
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 */
const seedAdmin = async () => {
    try {
        const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

        // Check if required environment variables are present
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.log('ℹ️ Skipping admin seed: ADMIN_EMAIL/ADMIN_PASSWORD not set in .env');
            return;
        }

        const email = ADMIN_EMAIL.toLowerCase();
        const password = ADMIN_PASSWORD;
        const name = ADMIN_NAME || 'Admin';

        // Check if admin already exists
        const existing = await User.findOne({ email });
        if (existing) return; // Admin already present, no action needed

        // Create new admin user
        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({ name, email, passwordHash, role: 'admin' });
        console.log(`✅ Admin user ensured: ${email}`);
    } catch (e) {
        console.error("❌ Failed to seed admin:", e.message);
    }
};

/**
 * Backfills OPENING_STOCK transactions for existing products where they are missing.
 * This ensures that products added before the stock system was fully active still have their initial stock recorded.
 */
const backfillOpeningStock = async () => {
    try {
        // Find products that have an opening stock value greater than 0
        const products = await Product.find({ openingStock: { $gt: 0 } });
        let created = 0;

        for (const p of products) {
            // Check if an OPENING_STOCK transaction already exists for this product
            const exists = await StockTxn.exists({ product: p._id, refType: 'OPENING_STOCK' });

            if (!exists) {
                // Create the missing stock transaction
                await StockTxn.create({
                    product: p._id,
                    qty: Number(p.openingStock) || 0,
                    uom: p.uom || 'Bag',
                    refType: 'OPENING_STOCK',
                    notes: 'Backfill opening stock from product.openingStock',
                });
                created++;
            }
        }

        if (created > 0) {
            console.log(`✅ Opening stock backfill complete. Created ${created} transaction(s).`);
        }
    } catch (e) {
        console.error('❌ Opening stock backfill failed:', e.message);
    }
};

/**
 * Initializes the system by running necessary startup tasks.
 * This should be called when the server starts and connects to the database.
 */
export const initializeSystem = async () => {
    console.log('🚀 Initializing system...');
    await seedAdmin();
    await backfillOpeningStock();
    console.log('✨ System initialization complete.');
};
