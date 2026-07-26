import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

const superAdmin = {
  firstName: process.env.SUPER_ADMIN_FIRST_NAME || "BEA",
  lastName: process.env.SUPER_ADMIN_LAST_NAME || "Super Admin",
  username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
  email: process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase(),
  password: process.env.SUPER_ADMIN_PASSWORD,
};

async function seedSuperAdmin() {
  if (!superAdmin.email || !superAdmin.password) {
    throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set before running this seed.");
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(superAdmin.password)) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
  }

  const existingAdmin = await prisma.admins.findUnique({
    where: { email: superAdmin.email },
  });

  if (existingAdmin) {
    const updatedAdmin = await prisma.admins.update({
      where: { email: superAdmin.email },
      data: {
        role: "super",
        status: "active",
        permissions: null,
      },
      select: { id: true, email: true, username: true, role: true, status: true },
    });

    console.log("Super admin already existed and was reactivated:", updatedAdmin);
    return;
  }

  const passwordHash = await bcrypt.hash(superAdmin.password, 10);
  const createdAdmin = await prisma.admins.create({
    data: {
      first_name: superAdmin.firstName,
      last_name: superAdmin.lastName,
      full_name: `${superAdmin.firstName} ${superAdmin.lastName}`.trim(),
      username: superAdmin.username,
      email: superAdmin.email,
      password: passwordHash,
      role: "super",
      status: "active",
      permissions: null,
      created_by_name: "System seed",
    },
    select: { id: true, email: true, username: true, role: true, status: true },
  });

  console.log("Super admin created successfully:", createdAdmin);
}

seedSuperAdmin()
  .catch((error) => {
    console.error("Failed to seed super admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
