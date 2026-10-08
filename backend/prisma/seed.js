require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma.js");

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !username || !password) {
    throw new Error(
      "Set ADMIN_EMAIL, ADMIN_USERNAME, and ADMIN_PASSWORD before running the admin seed.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.blog_User.upsert({
    where: { email },
    create: {
      email,
      username,
      password: hashedPassword,
      role: "ADMIN",
    },
    update: {
      username,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin account provisioned for ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
