import dotenv from 'dotenv';
import app from './app.js';
import connectDB from '../config/db.js';
import User from '../models/auth/user.model.js';
import bcrypt from 'bcrypt';

dotenv.config();

import PRCenter from '../models/govwheatpurchaseModels/prcenter.model.js';

const seedAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    const email = (ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const password = ADMIN_PASSWORD || 'pass';
    const name = ADMIN_NAME || 'Admin';
    const existing = await User.findOne({ email });
    if (existing) return;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash, role: 'admin' });
    console.log(`✅ Admin user ensured: ${email}`);
  } catch (e) {
    console.error('❌ Failed to seed admin:', e.message);
  }
};

const seedPRCenters = async () => {
  try {
    const prCenters = [
      { centerCode: 'PRC001', centerName: 'Lahore PR Center', location: 'Lahore' },
      { centerCode: 'PRC002', centerName: 'Kasur PR Center', location: 'Kasur' },
      { centerCode: 'PRC003', centerName: 'Faisalabad PR Center', location: 'Faisalabad' }
    ];

    for (const pc of prCenters) {
      const existing = await PRCenter.findOne({ centerCode: pc.centerCode });
      if (!existing) {
        await PRCenter.create(pc);
        console.log(`✅ PR Center ensured: ${pc.centerName}`);
      }
    }
  } catch (e) {
    console.error('❌ Failed to seed PR centers:', e.message);
  }
};

(async () => {
  const dbConnected = await connectDB();

  // Only seed admin if database is connected
  if (dbConnected) {
    await seedAdmin();
    await seedPRCenters();
  }

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (!dbConnected) {
      console.log(`⚠️ WARNING: Database not connected - limited functionality`);
    }
  });
})();
