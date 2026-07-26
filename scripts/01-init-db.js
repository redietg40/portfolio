/**
 * Database Initialization Script
 * Initializes tables and seeds initial portfolio data
 * Run with: node scripts/01-init-db.js
 */

require("dotenv").config()
const { Pool } = require("pg")
const { PrismaPg } = require("@prisma/adapter-pg")
const { PrismaClient } = require("./../src/generated/prisma")

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log("🔄 Initializing database...")

    // Clear existing data (optional - comment out to keep data)
    console.log("📋 Clearing existing data...")
    await prisma.project.deleteMany({})
    await prisma.skill.deleteMany({})
    await prisma.about.deleteMany({})

    // Initialize About section
    console.log("📝 Creating About section...")
    const about = await prisma.about.create({
      data: {
        text: "I am a software developer that loves building both user interfaces and server backends. During my learning journey, I met and conquered several hurdles, which helped me gain significant experience and enhance my skills. I enjoy learning new technologies and working with people to develop effective, user-friendly, and impactful solutions.",
      },
    })
    console.log("✅ About section created")

    // Initialize Skills
    console.log("🛠️ Creating skills...")
    const skillsData = [
      { name: "HTML", percentage: 90, icon: "fa-brands fa-html5", category: "frontend" },
      { name: "CSS", percentage: 85, icon: "fa-brands fa-css3-alt", category: "frontend" },
      { name: "JavaScript", percentage: 85, icon: "fa-brands fa-js", category: "frontend" },
      { name: "React", percentage: 80, icon: "fa-brands fa-react", category: "frontend" },
      { name: "Tailwind CSS", percentage: 75, icon: "fa-solid fa-wind", category: "frontend" },
      { name: "Bootstrap", percentage: 70, icon: "fa-brands fa-bootstrap", category: "frontend" },
      { name: "Node.js", percentage: 80, icon: "fa-brands fa-node-js", category: "backend" },
      { name: "Express.js", percentage: 75, icon: "fa-solid fa-server", category: "backend" },
      { name: "PostgreSQL", percentage: 75, icon: "fa-solid fa-database", category: "backend" },
      { name: "MongoDB", percentage: 70, icon: "fa-solid fa-database", category: "backend" },
      { name: "Git", percentage: 60, icon: "fa-brands fa-git-alt", category: "tools" },
      { name: "GitHub", percentage: 70, icon: "fa-brands fa-github", category: "tools" },
      { name: "VS Code", percentage: 75, icon: "fa-solid fa-code", category: "tools" },
      { name: "npm", percentage: 65, icon: "fa-brands fa-npm", category: "tools" },
    ]

    const skills = await Promise.all(skillsData.map((skill) => prisma.skill.create({ data: skill })))
    console.log(`✅ ${skills.length} skills created`)

    // Initialize Projects
    console.log("🎯 Creating projects...")
    const projectsData = [
      {
        name: "Internship Placement Platform",
        description:
          "A comprehensive platform connecting students with internship opportunities. Built with React and Node.js with user authentication, search filters, and application tracking.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
        liveUrl: "#",
        githubUrl: "#",
      },
      {
        name: "Ethio Trip Platform",
        description:
          "An interactive travel platform for discovering curated tours and cultural highlights across Ethiopia. Features interactive maps, booking system, and local guide information.",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
        liveUrl: "#",
        githubUrl: "#",
      },
      {
        name: "Weather Dashboard",
        description:
          "A responsive real-time weather application with interactive charts, location search, and weather forecasts. Uses weather APIs and displays data with beautiful visualizations.",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
        liveUrl: "#",
        githubUrl: "#",
      },
      {
        name: "E-commerce Platform",
        description:
          "A full-featured electronic device delivery platform with shopping cart, user reviews, order tracking, and secure payment integration using Stripe.",
        image: "https://images.unsplash.com/photo-1460925895917-adf4198c838d?w=600&h=400&fit=crop",
        liveUrl: "#",
        githubUrl: "#",
      },
      {
        name: "Brokerage Management System",
        description:
          "A secure platform connecting verified brokers with customers. Features broker registration, property listing management, admin dashboard, and transaction tracking.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        liveUrl: "#",
        githubUrl: "#",
      },
    ]

    const projects = await Promise.all(projectsData.map((project) => prisma.project.create({ data: project })))
    console.log(`✅ ${projects.length} projects created`)

    console.log("\n✨ Database initialization completed successfully!")
    console.log("📊 Summary:")
    console.log(`   - About: 1 entry`)
    console.log(`   - Skills: ${skills.length} entries`)
    console.log(`   - Projects: ${projects.length} entries`)
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

initializeDatabase()
