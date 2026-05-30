#!/usr/bin/env node
/**
 * VEXORA Database Seed Script
 * Creates demo organization, user, metrics, activities, reports, and notifications.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../server/config/db.js';
import User from '../server/models/User.js';
import Organization from '../server/models/Organization.js';
import { seedOrganizationData } from '../server/services/organizationService.js';

dotenv.config();

const DEMO_USER = {
  fullName: 'Krish Kapuriya',
  email: 'demo@vexora.ai',
  password: 'DemoPass123!',
  role: 'Admin',
};

const DEMO_ORG = {
  name: 'VEXORA Labs',
  industry: 'SaaS / Analytics',
  size: '51-200',
  logo: '',
};

async function seed() {
  await connectDB();

  let user = await User.findOne({ email: DEMO_USER.email }).select('+password');

  if (!user) {
    user = await User.create(DEMO_USER);
    console.log('[seed] Created demo user:', user.email);
  } else {
    console.log('[seed] Demo user already exists:', user.email);
  }

  let organization = await Organization.findOne({ owner: user._id });

  if (!organization) {
    organization = await Organization.create({ ...DEMO_ORG, owner: user._id });
    user.organization = organization._id;
    await user.save();
    console.log('[seed] Created organization:', organization.name);
  } else {
    console.log('[seed] Organization already exists:', organization.name);
  }

  await seedOrganizationData(organization._id, user._id);
  console.log('[seed] Seeded metrics, activities, reports, and notifications');

  console.log('\n✅ Seed complete');
  console.log('   Email:    demo@vexora.ai');
  console.log('   Password: DemoPass123!');
  console.log('   Org:      VEXORA Labs\n');

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('[seed] Failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
