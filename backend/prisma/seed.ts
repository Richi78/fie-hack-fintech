import 'dotenv/config'
import { prisma } from '../src/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@tinka.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@tinka.com',
      passwordHash,
    },
  })

  console.log('Seed completado: Usuario admin@tinka.com creado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })