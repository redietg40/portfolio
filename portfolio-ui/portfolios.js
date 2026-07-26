/**
 * Secure Portfolio JavaScript
 * Security improvements:
 * 1. No innerHTML with user input - using textContent and DOM APIs
 * 2. Input sanitization for form data
 * 3. External links use rel="noopener noreferrer"
 * 4. Form validation with rate limiting
 * 5. XSS prevention via escaping
 */

// ============================================
// SECURITY UTILITIES
// ============================================

function sanitizeInput(str) {
  if (typeof str !== "string") return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url)
    return ["http:", "https:"].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

function createSecureLink(href, iconClass, ariaLabel) {
  const link = document.createElement("a")
  link.href = href
  link.className = "project-link"
  link.setAttribute("rel", "noopener noreferrer")
  link.setAttribute("target", "_blank")
  link.setAttribute("aria-label", ariaLabel)

  const icon = document.createElement("i")
  icon.className = iconClass
  link.appendChild(icon)

  return link
}

function createTextElement(tag, text, className = "") {
  const element = document.createElement(tag)
  element.textContent = text
  if (className) element.className = className
  return element
}

// ============================================
// API CONFIGURATION
// ============================================

const API_URL = "http://localhost:3000/api"
const VERIFICATION_BASE = API_URL.replace(/\/api\/?$/, "")

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_PORTFOLIO_DATA = {
  name: "Rediet Getahun",
  title: "Full-stack Software Developer",
  about: `I am software developer that loves building both user interfaces and server backends.
    During my learning journey, I met and conquered several hurdles,
    which helped me gain significant experience and enhance my skills.
    Additionally, I like learning new technologies and working with people to develop effective,
    user-friendly, and significant solutions`,
  contact: {
    email: "redu.getahun21@email.com",
    phone: "+251 9 60 55 08 90",
    address: "BahirDar, Ethiopia",
    linkedin: "https://linkedin.com/in/rediet-getahun",
    github: "https://github.com/redietg40",
    instagram: "https://instagram.com/redu192123",
  },
}

const DEFAULT_SKILLS = {
  frontend: [
    { name: "HTML", percentage: 90, icon: "fa-brands fa-html5" },
    { name: "CSS", percentage: 80, icon: "fa-brands fa-css3-alt" },
    { name: "JavaScript", percentage: 80, icon: "fa-brands fa-js" },
    { name: "React", percentage: 75, icon: "fa-brands fa-react" },
    { name: "Bootstrap", percentage: 70, icon: "fa-brands fa-bootstrap" },
    { name: "Tailwind CSS", percentage: 65, icon: "fa-solid fa-wind" },
  ],
  tools: [
    { name: "Git", percentage: 50, icon: "fa-brands fa-git-alt" },
    { name: "GitHub", percentage: 60, icon: "fa-brands fa-github" },
    { name: "VS Code", percentage: 70, icon: "fa-solid fa-code" },
    { name: "npm", percentage: 60, icon: "fa-brands fa-npm" },
  ],
  backend: [
    { name: "Node.js", percentage: 75, icon: "fa-brands fa-node-js" },
    { name: "Express.js", percentage: 70, icon: "fa-solid fa-server" },
    { name: "Postman", percentage: 60, icon: "fa-solid fa-paper-plane" },
    { name: "PostgreSQL", percentage: 70, icon: "fa-solid fa-database" },
    { name: "MongoDB", percentage: 65, icon: "fa-solid fa-database" },
    { name: "phpMyAdmin", percentage: 60, icon: "fa-solid fa-database" },
  ],
}

const DEFAULT_PROJECTS = [
  {
    name: "University Selection Platform",
    image: "../images/university-selection-platform.png",
    description:
      "Built full-stack platform with Next.js (App Router) and React featuring role-based dashboards for students, universities, and MOE admins, coupled with a cross-platform React Native/Expo mobile app for placement tracking.",
    liveUrl: "#",
    githubUrl: "https://github.com/university-place/university-selection-platforms.git",
  },
  {
    name: "AddToCare — Women Empowerment Platform",
    image: "../images/addtocare-women-empowerment.png",
    description:
      "Engineered full-stack platform with Next.js/React featuring a three-dashboard architecture (Company, Admin, User), revenue-sharing model via PostgreSQL transactions for atomic fund allocation, and real-time analytics.",
    liveUrl: "#",
    githubUrl: "https://github.com/redietg40/Adstocares.git",
  },
  {
    name: "Internship Placement Platform",
    image: "../images/internship-platform-with-students-and-companies.jpg",
    description:
      "Developed full-stack PHP/MySQL platform for students to search/apply for internships and companies to manage postings, featuring secure company dashboard and dynamic student search filters.",
    liveUrl: "#",
    githubUrl: "https://github.com/redietg40/internship-placement.git",
  },
  {
    name: "Brokerage Management System",
    image: "../images/broker-images.jpg",
    description:
      "Built comprehensive platform for real estate/insurance brokers using PHP/MySQL with role-based access control, client management module with full CRUD operations, and reporting dashboards.",
    liveUrl: "#",
    githubUrl: "https://github.com/redietg40/brokermanagement-System.git",
  },
]


// ============================================
// RUNTIME DATA
// ============================================

let PORTFOLIO_DATA = { ...DEFAULT_PORTFOLIO_DATA }
let SKILLS = JSON.parse(JSON.stringify(DEFAULT_SKILLS))
let PROJECTS = [...DEFAULT_PROJECTS]

const NAV_ITEMS = Object.freeze([
  { href: "#home", text: "Home" },
  { href: "#about", text: "About" },
  { href: "#skills", text: "Skills" },
  { href: "#projects", text: "Projects" },
  { href: "#contact", text: "Contact" },
])

const FLOATING_ICONS = Object.freeze([
  "fa-brands fa-html5",
  "fa-brands fa-css3-alt",
  "fa-brands fa-js",
  "fa-brands fa-react",
])

function getContactItems() {
  return [
    {
      icon: "fas fa-envelope",
      title: "Email",
      value: PORTFOLIO_DATA.contact.email,
      href: `mailto:${PORTFOLIO_DATA.contact.email}`,
    },
    {
      icon: "fas fa-phone",
      title: "Phone",
      value: PORTFOLIO_DATA.contact.phone,
      href: `tel:${PORTFOLIO_DATA.contact.phone.replace(/\s/g, "")}`,
    },
    { icon: "fas fa-map-marker-alt", title: "Address", value: PORTFOLIO_DATA.contact.address, href: null },
    {
      icon: "fab fa-linkedin",
      title: "LinkedIn",
      value: "linkedin.com/in/rediet-getahun",
      href: PORTFOLIO_DATA.contact.linkedin,
      external: true,
    },
    {
      icon: "fab fa-github",
      title: "GitHub",
      value: "github.com/redietg40",
      href: PORTFOLIO_DATA.contact.github,
      external: true,
    },
    {
      icon: "fab fa-instagram",
      title: "Instagram",
      value: "@rediet_getahun",
      href: PORTFOLIO_DATA.contact.instagram,
      external: true,
    },
  ]
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderHeader() {
  const header = document.getElementById("header-container")
  if (!header) return

  const hamburger = document.createElement("button")
  hamburger.className = "hamburger"
  hamburger.setAttribute("aria-label", "Toggle navigation menu")
  hamburger.setAttribute("aria-expanded", "false")

  for (let i = 0; i < 3; i++) {
    const span = document.createElement("span")
    hamburger.appendChild(span)
  }

  const overlay = document.createElement("div")
  overlay.className = "nav-overlay"
  overlay.id = "nav-overlay"

  const nav = document.createElement("nav")
  const ul = document.createElement("ul")
  ul.className = "nav"
  ul.id = "nav-menu"

  NAV_ITEMS.forEach((item) => {
    const li = document.createElement("li")
    const a = document.createElement("a")
    a.href = item.href
    a.textContent = item.text
    li.appendChild(a)
    ul.appendChild(li)
  })

  nav.appendChild(ul)

  header.appendChild(hamburger)
  header.appendChild(nav)

  document.body.appendChild(overlay)

  initializeHamburgerMenu(hamburger, ul, overlay)
}

function renderHero() {
  const heroContainer = document.getElementById("hero-container")
  if (!heroContainer) return

  const introduction = document.createElement("div")
  introduction.className = "introduction"

  const h1 = document.createElement("h1")
  h1.className = "name"
  h1.innerHTML = `Hi I am <span class="highlight">${sanitizeInput(PORTFOLIO_DATA.name)}</span>`

  const h2 = document.createElement("h2")
  h2.id = "typewriter-title"

  const h3 = createTextElement(
    "h3",
    "I have experience in building responsive and interactive web applications using modern front-end and back-end technologies.",
  )

  const buttons = document.createElement("div")
  buttons.className = "buttons"

  const exploreBtn = document.createElement("button")
  exploreBtn.className = "explore"
  const exploreLink = document.createElement("a")
  exploreLink.href = "#projects"
  exploreLink.textContent = "Explore My Projects"
  exploreBtn.appendChild(exploreLink)

  const contactBtn = document.createElement("button")
  contactBtn.className = "btn-contact"
  const contactLink = document.createElement("a")
  contactLink.href = "#contact"
  contactLink.textContent = "Contact Me"
  contactBtn.appendChild(contactLink)

  buttons.appendChild(exploreBtn)
  buttons.appendChild(contactBtn)

  introduction.appendChild(h1)
  introduction.appendChild(h2)
  introduction.appendChild(h3)
  introduction.appendChild(buttons)

  const profile = document.createElement("div")
  profile.className = "profile"

  const profileImage = document.createElement("div")
  profileImage.className = "profile-image"

  const img = document.createElement("img")
  img.src = `images/ffff.jpg`
  img.alt = `${PORTFOLIO_DATA.name} Profile`
  img.loading = "lazy"
  profileImage.appendChild(img)

  const floatingElements = document.createElement("div")
  floatingElements.className = "floating-elements"

  FLOATING_ICONS.forEach((iconClass) => {
    const floatingIcon = document.createElement("div")
    floatingIcon.className = "floating-icon"
    const icon = document.createElement("i")
    icon.className = iconClass
    floatingIcon.appendChild(icon)
    floatingElements.appendChild(floatingIcon)
  })

  profile.appendChild(profileImage)
  profile.appendChild(floatingElements)

  heroContainer.appendChild(introduction)
  heroContainer.appendChild(profile)
}

function renderAbout() {
  const aboutSection = document.getElementById("about")
  if (!aboutSection) return

  const title = createTextElement("p", "About Me", "about-me")
  const description = createTextElement("p", PORTFOLIO_DATA.about, "about-fade")
  description.id = "about-typewriter"

  aboutSection.appendChild(title)
  aboutSection.appendChild(description)
}

function renderSkills() {
  const skillsSection = document.getElementById("skills")
  if (!skillsSection) return

  const title = createTextElement("p", "Skills", "skill-title")

  const categories = document.createElement("div")
  categories.className = "skill-categories"

  const tabs = [
    { id: "frontend", text: "Frontend", active: true },
    { id: "tools", text: "Tools", active: false },
    { id: "backend", text: "Backend", active: false },
  ]

  tabs.forEach((tab) => {
    const button = document.createElement("button")
    button.className = tab.active ? "active" : ""
    button.setAttribute("data-tab-target", `#${tab.id}`)
    button.textContent = tab.text
    categories.appendChild(button)
  })

  const skillContainer = document.createElement("div")
  skillContainer.className = "skill-container"

  Object.entries(SKILLS).forEach(([category, skills]) => {
    const panel = document.createElement("div")
    panel.id = category
    panel.className = category === "frontend" ? "all-skills active" : "all-skills"
    panel.setAttribute("data-tab-content", "")

    skills.forEach((skill) => {
      const skillCard = document.createElement("div")
      skillCard.className = `${skill.name.toLowerCase().replace(/\s/g, "-")}-content all-active`

      const symbolDiv = document.createElement("div")
      symbolDiv.className = "skill-symbol"
      const icon = document.createElement("i")
      icon.className = skill.icon
      symbolDiv.appendChild(icon)

      const infoDiv = document.createElement("div")
      infoDiv.className = "skill-info"

      const skillName = createTextElement("h3", skill.name)

      const progressBar = document.createElement("div")
      progressBar.className = "progress-bar"
      const progress = document.createElement("div")
      progress.className = "progress"
      progress.style.width = `${skill.percentage}%`
      progressBar.appendChild(progress)

      const percentage = createTextElement("span", `${skill.percentage}%`, "skill-percentage")

      infoDiv.appendChild(skillName)
      infoDiv.appendChild(progressBar)
      infoDiv.appendChild(percentage)

      skillCard.appendChild(symbolDiv)
      skillCard.appendChild(infoDiv)
      panel.appendChild(skillCard)
    })

    skillContainer.appendChild(panel)
  })

  skillsSection.appendChild(title)
  skillsSection.appendChild(categories)
  skillsSection.appendChild(skillContainer)

  initializeTabs()
}

function renderProjects() {
  const projectsSection = document.getElementById("projects")
  if (!projectsSection) return

  const title = createTextElement("p", "My Projects", "projects-title")

  const grid = document.createElement("div")
  grid.className = "projects-grid"
  grid.id = "projectcontainers"

  PROJECTS.forEach((project, index) => {
    const card = document.createElement("div")
    card.className = "project-card"
    card.style.animationDelay = `${index * 0.1}s`

    const imageContainer = document.createElement("div")
    imageContainer.className = "project-image"

    const img = document.createElement("img")
    img.src = project.image
    img.alt = project.name
    img.loading = "lazy"
    img.onerror = function () {
      this.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
    }

    const overlay = document.createElement("div")
    overlay.className = "project-overlay"

    const links = document.createElement("div")
    links.className = "project-links"

    const liveLink = createSecureLink(project.liveUrl, "fas fa-external-link-alt", `View ${project.name} live`)
    const githubLink = createSecureLink(project.githubUrl, "fab fa-github", `View ${project.name} on GitHub`)

    links.appendChild(liveLink)
    links.appendChild(githubLink)
    overlay.appendChild(links)

    imageContainer.appendChild(img)
    imageContainer.appendChild(overlay)

    const info = document.createElement("div")
    info.className = "project-info"

    const projectTitle = createTextElement("h3", project.name)
    const projectDesc = createTextElement("p", project.description)

    info.appendChild(projectTitle)
    info.appendChild(projectDesc)

    card.appendChild(imageContainer)
    card.appendChild(info)
    grid.appendChild(card)
  })

  projectsSection.appendChild(title)
  projectsSection.appendChild(grid)
}

function renderContact() {
  const contactSection = document.getElementById("contact")
  if (!contactSection) return

  const title = createTextElement("p", "Get in Touch", "contact-title")
  const subtitle = createTextElement(
    "p",
    "If you have any questions or want to collaborate, feel free to reach out!",
    "contact-subtitle",
  )

  const content = document.createElement("div")
  content.className = "contact-content"

  const infoContainer = document.createElement("div")
  infoContainer.className = "contact-info"

  const CONTACT_ITEMS = getContactItems()
  CONTACT_ITEMS.forEach((item) => {
    const contactItem = document.createElement("div")
    contactItem.className = "contact-item"

    const iconDiv = document.createElement("div")
    iconDiv.className = "contact-icon"
    const icon = document.createElement("i")
    icon.className = item.icon
    iconDiv.appendChild(icon)

    const detailsDiv = document.createElement("div")
    detailsDiv.className = "contact-details"

    const itemTitle = createTextElement("h4", item.title)

    const itemValue = document.createElement("p")
    if (item.href) {
      const link = document.createElement("a")
      link.href = item.href
      link.textContent = item.value
      if (item.external) {
        link.setAttribute("target", "_blank")
        link.setAttribute("rel", "noopener noreferrer")
      }
      itemValue.appendChild(link)
    } else {
      itemValue.textContent = item.value
    }

    detailsDiv.appendChild(itemTitle)
    detailsDiv.appendChild(itemValue)

    contactItem.appendChild(iconDiv)
    contactItem.appendChild(detailsDiv)
    infoContainer.appendChild(contactItem)
  })

  const formContainer = document.createElement("div")
  formContainer.className = "contact-form"

  const form = document.createElement("form")
  form.id = "contact-form"
  form.setAttribute("novalidate", "")

  const nameGroup = createFormGroup("name", "text", "Name:", "Your full name")
  const emailGroup = createFormGroup("email", "email", "Email:", "your.email@example.com")

  const messageGroup = document.createElement("div")
  messageGroup.className = "form-group"

  const messageLabel = document.createElement("label")
  messageLabel.setAttribute("for", "message")
  messageLabel.textContent = "Message:"

  const messageTextarea = document.createElement("textarea")
  messageTextarea.id = "message"
  messageTextarea.name = "message"
  messageTextarea.rows = 6
  messageTextarea.placeholder = "Tell me about your project or just say hello!"
  messageTextarea.required = true
  messageTextarea.maxLength = 1000

  const messageError = createTextElement("span", "", "error-message")
  messageError.id = "message-error"

  messageGroup.appendChild(messageLabel)
  messageGroup.appendChild(messageTextarea)
  messageGroup.appendChild(messageError)

  const submitBtn = document.createElement("button")
  submitBtn.type = "submit"
  submitBtn.className = "submit-btn"
  submitBtn.textContent = "Send Message"

  const successMessage = createTextElement(
    "div",
    "Thank you! Your message has been sent successfully.",
    "success-message",
  )
  successMessage.id = "success-message"

  form.appendChild(nameGroup)
  form.appendChild(emailGroup)
  form.appendChild(messageGroup)
  form.appendChild(submitBtn)
  form.appendChild(successMessage)

  formContainer.appendChild(form)

  content.appendChild(infoContainer)
  content.appendChild(formContainer)

  contactSection.appendChild(title)
  contactSection.appendChild(subtitle)
  contactSection.appendChild(content)

  initializeForm()
}

function createFormGroup(id, type, labelText, placeholder) {
  const group = document.createElement("div")
  group.className = "form-group"

  const label = document.createElement("label")
  label.setAttribute("for", id)
  label.textContent = labelText

  const input = document.createElement("input")
  input.type = type
  input.id = id
  input.name = id
  input.placeholder = placeholder
  input.required = true
  input.maxLength = type === "email" ? 254 : 100

  const error = createTextElement("span", "", "error-message")
  error.id = `${id}-error`

  group.appendChild(label)
  group.appendChild(input)
  group.appendChild(error)

  return group
}

function renderFooter() {
  const footer = document.getElementById("footer-container")
  if (!footer) return

  const container = document.createElement("div")
  container.className = "container"

  const p = document.createElement("p")
  p.innerHTML = `&copy; ${new Date().getFullYear()} ${sanitizeInput(PORTFOLIO_DATA.name)}. All rights reserved. Made with <i class="fas fa-heart"></i> in Ethiopia`

  container.appendChild(p)
  footer.appendChild(container)
}

// ============================================
// INTERACTIVE FEATURES
// ============================================

function initializeTabs() {
  const tabs = document.querySelectorAll("[data-tab-target]")
  const tabContents = document.querySelectorAll("[data-tab-content]")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = document.querySelector(tab.dataset.tabTarget)

      tabContents.forEach((content) => content.classList.remove("active"))
      tabs.forEach((t) => t.classList.remove("active"))

      target.classList.add("active")
      tab.classList.add("active")
    })
  })
}

function typeWriter(elementId, text, speed = 100) {
  const element = document.getElementById(elementId)
  if (!element) return

  let index = 0

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index)
      index++
      setTimeout(type, speed)
    }
  }

  type()
}

function initializeForm() {
  const form = document.getElementById("contact-form")
  if (!form) return

  let lastSubmitTime = 0
  const RATE_LIMIT_MS = 30000

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const now = Date.now()
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000)
      alert(`Please wait ${waitTime} seconds before submitting again.`)
      return
    }

    clearErrors()

    const nameInput = document.getElementById("name")
    const emailInput = document.getElementById("email")
    const messageInput = document.getElementById("message")

    const name = sanitizeInput(nameInput.value)
    const email = sanitizeInput(emailInput.value)
    const message = sanitizeInput(messageInput.value)

    let isValid = true

    if (!name || name.length < 2) {
      showError("name", "Please enter a valid name (at least 2 characters).")
      isValid = false
    } else if (name.length > 100) {
      showError("name", "Name is too long (max 100 characters).")
      isValid = false
    }

    if (!email || !isValidEmail(email)) {
      showError("email", "Please enter a valid email address.")
      isValid = false
    }

    if (!message || message.length < 10) {
      showError("message", "Please enter a message (at least 10 characters).")
      isValid = false
    } else if (message.length > 1000) {
      showError("message", "Message is too long (max 1000 characters).")
      isValid = false
    }

    if (!isValid) return

    const submitBtn = form.querySelector(".submit-btn")
    submitBtn.disabled = true
    submitBtn.textContent = "Verifying email..."

    try {
      // 1) Ask server to send a verification email (user must click link)
      await fetch(`${VERIFICATION_BASE}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      // 2) Show simple in-form notice with a button to check verification status
      let notice = document.getElementById("verify-notice")
      if (!notice) {
        notice = document.createElement("div")
        notice.id = "verify-notice"
        notice.className = "verify-notice"
        const p = document.createElement("p")
        p.textContent = "A verification email was sent to your address. Please open your inbox and click the verification link."
        const checkBtn = document.createElement("button")
        checkBtn.type = "button"
        checkBtn.textContent = "I clicked the link — check status"
        checkBtn.className = "check-verification"

        const cancelBtn = document.createElement("button")
        cancelBtn.type = "button"
        cancelBtn.textContent = "Cancel"
        cancelBtn.className = "cancel-verification"

        notice.appendChild(p)
        notice.appendChild(checkBtn)
        notice.appendChild(cancelBtn)
        form.appendChild(notice)

        checkBtn.addEventListener("click", async () => {
          checkBtn.disabled = true
          checkBtn.textContent = "Checking..."
          const statusResp = await fetch(`${VERIFICATION_BASE}/verify-status?email=${encodeURIComponent(email)}`)
          const statusData = await statusResp.json()
          if (statusData && statusData.success && statusData.verified) {
            // proceed to submit contact
            await submitContact({ name, email, message, form, submitBtn })
            notice.remove()
          } else {
            alert('Email not verified yet. Please click the link from your email and then press this button.')
            checkBtn.disabled = false
            checkBtn.textContent = "I clicked the link — check status"
          }
        })

        cancelBtn.addEventListener("click", () => {
          notice.remove()
          submitBtn.disabled = false
          submitBtn.textContent = "Send Message"
        })
      }

      // Optionally, auto-poll for verification for a short period (user experience improvement)
      const MAX_POLL_MS = 60 * 1000 // 1 minute
      const POLL_INTERVAL = 5000
      const start = Date.now()

      const poll = setInterval(async () => {
        if (Date.now() - start > MAX_POLL_MS) {
          clearInterval(poll)
          return
        }
        try {
          const statusResp = await fetch(`${VERIFICATION_BASE}/verify-status?email=${encodeURIComponent(email)}`)
          const statusData = await statusResp.json()
          if (statusData && statusData.success && statusData.verified) {
            clearInterval(poll)
            await submitContact({ name, email, message, form, submitBtn })
            const n = document.getElementById('verify-notice')
            if (n) n.remove()
          }
        } catch (e) {
          // ignore polling errors
        }
      }, POLL_INTERVAL)
    } catch (error) {
      console.error('Verification flow error:', error)
      alert('There was an error starting the verification process. Please try again later.')
      submitBtn.disabled = false
      submitBtn.textContent = 'Send Message'
    }
  })

    ;["name", "email", "message"].forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (field) {
        field.addEventListener("blur", () => validateField(fieldId))
        field.addEventListener("input", () => {
          field.classList.remove("error")
          const errorEl = document.getElementById(`${fieldId}-error`)
          if (errorEl) errorEl.classList.remove("visible")
        })
      }
    })
}

// Helper to actually send the contact message after verification.
async function submitContact({ name, email, message, form, submitBtn }) {
  try {
    submitBtn.textContent = 'Sending message...'
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      const successMessage = document.getElementById('success-message')
      successMessage.classList.add('visible')
      form.reset()
      setTimeout(() => successMessage.classList.remove('visible'), 5000)
    } else {
      throw new Error(data.error || 'Failed to send message')
    }
  } catch (err) {
    console.error('Contact submit error after verification:', err)
    alert('Failed to send message after verification. Please try again later.')
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = 'Send Message'
  }
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const errorEl = document.getElementById(`${fieldId}-error`)

  if (field) field.classList.add("error")
  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.add("visible")
  }
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = ""
    el.classList.remove("visible")
  })
}

function validateField(fieldId) {
  const field = document.getElementById(fieldId)
  if (!field) return

  const value = sanitizeInput(field.value)

  switch (fieldId) {
    case "name":
      if (value && value.length >= 2 && value.length <= 100) {
        field.classList.remove("error")
      }
      break
    case "email":
      if (value && isValidEmail(value)) {
        field.classList.remove("error")
      }
      break
    case "message":
      if (value && value.length >= 10 && value.length <= 1000) {
        field.classList.remove("error")
      }
      break
  }
}

function initializeHamburgerMenu(hamburger, navMenu, overlay) {
  hamburger.addEventListener("click", () => {
    const isActive = hamburger.classList.contains("active")

    hamburger.classList.toggle("active")
    navMenu.classList.toggle("active")
    overlay.classList.toggle("active")

    hamburger.setAttribute("aria-expanded", !isActive)

    document.body.style.overflow = isActive ? "" : "hidden"
  })

  overlay.addEventListener("click", () => {
    closeMenu(hamburger, navMenu, overlay)
  })

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(hamburger, navMenu, overlay)
    })
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.classList.contains("active")) {
      closeMenu(hamburger, navMenu, overlay)
    }
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && hamburger.classList.contains("active")) {
      closeMenu(hamburger, navMenu, overlay)
    }
  })
}

function closeMenu(hamburger, navMenu, overlay) {
  hamburger.classList.remove("active")
  navMenu.classList.remove("active")
  overlay.classList.remove("active")
  hamburger.setAttribute("aria-expanded", "false")
  document.body.style.overflow = ""
}

// ============================================
// LOAD DATA FROM API
// ============================================

async function loadPortfolioData() {
  try {
    const response = await fetch(`${API_URL}/portfolio`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      if (data.about && data.about.trim()) {
        PORTFOLIO_DATA.about = data.about
      }

      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        data.skills.forEach((skill) => {
          const category = (skill.category || "").toLowerCase().trim()

          let targetCategory = "tools"
          if (category === "frontend" || category === "front-end") {
            targetCategory = "frontend"
          } else if (category === "backend" || category === "back-end") {
            targetCategory = "backend"
          } else if (category === "tools" || category === "tool") {
            targetCategory = "tools"
          }

          const skillExists = SKILLS[targetCategory].some(
            (existingSkill) => existingSkill.name.toLowerCase() === skill.name.toLowerCase()
          )

          if (!skillExists) {
            SKILLS[targetCategory].push({
              name: skill.name,
              percentage: skill.percentage || 0,
              icon: skill.icon || "fa-solid fa-code",
            })
          }
        })
      }

      if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        data.projects.forEach((project) => {
          const existingIndex = PROJECTS.findIndex(
            (existingProject) => existingProject.name.toLowerCase().trim() === project.name.toLowerCase().trim()
          )

          if (existingIndex === -1) {
            if (project.githubUrl && project.githubUrl !== "#") {
              PROJECTS.push({
                name: project.name,
                description: project.description,
                image: project.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
                liveUrl: project.liveUrl || "#",
                githubUrl: project.githubUrl,
              })
            }
          } else {
            if (project.githubUrl && project.githubUrl !== "#" && project.githubUrl.trim() !== "") {
              PROJECTS[existingIndex].githubUrl = project.githubUrl
            }
            if (project.liveUrl && project.liveUrl !== "#" && project.liveUrl.trim() !== "") {
              PROJECTS[existingIndex].liveUrl = project.liveUrl
            }
          }
        })
      }
    }
  } catch (error) {
    console.error("Error loading portfolio data from API, using defaults:", error)
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadPortfolioData()

  renderHeader()
  renderHero()
  renderAbout()
  renderSkills()
  renderProjects()
  renderContact()
  renderFooter()

  typeWriter("typewriter-title", PORTFOLIO_DATA.title)

  const aboutText = document.getElementById("about-typewriter")
  if (aboutText) {
    setTimeout(() => {
      aboutText.classList.add("visible")
    }, 500)
  }
})
