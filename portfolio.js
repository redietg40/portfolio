// DOM Elements
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")
const navLinks = document.querySelectorAll(".nav-link")
const backToTop = document.getElementById("backToTop")
const skillCategories = document.querySelectorAll(".skill-category")
const skillItems = document.querySelectorAll(".skill-item")
const filterBtns = document.querySelectorAll(".filter-btn")
const projectCards = document.querySelectorAll(".project-card")
const contactForm = document.getElementById("contact-form")
const statNumbers = document.querySelectorAll(".stat-number")

// Mobile Navigation Toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
});

// Close mobile menu when clicking on a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  })
})

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar")
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)"
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.15)"
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
  }
})

// Active navigation link
window.addEventListener("scroll", () => {
  let current = ""
  const sections = document.querySelectorAll("section")

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active")
    }
  })
})

// Back to top button
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.classList.add("show")
  } else {
    backToTop.classList.remove("show")
  }
})

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
})

// Animated counter for stats
function animateCounter(element, target) {
  let current = 0
  const increment = target / 100
  const timer = setInterval(() => {
    current += increment
    element.textContent = Math.floor(current)
    if (current >= target) {
      element.textContent = target
      clearInterval(timer)
    }
  }, 20)
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Animate stats
      if (entry.target.classList.contains("about-stats")) {
        statNumbers.forEach((stat) => {
          const target = Number.parseInt(stat.getAttribute("data-target"))
          animateCounter(stat, target)
        })
      }

      // Animate skill bars
      if (entry.target.classList.contains("skills-grid")) {
        const activeSkills = document.querySelectorAll(".skill-item.active")
        activeSkills.forEach((skill) => {
          const progress = skill.querySelector(".skill-progress")
          const percentage = skill.getAttribute("data-skill")
          setTimeout(() => {
            progress.style.width = percentage + "%"
          }, 200)
        })
      }

      // Add fade-in animation
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Observe elements for animation
document.querySelectorAll(".about-stats, .skills-grid, .projects-grid, .contact-content").forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "all 0.6s ease"
  observer.observe(el)
})

// Skills category switching
skillCategories.forEach((category) => {
  category.addEventListener("click", () => {
    const targetCategory = category.getAttribute("data-category")

    // Update active category
    skillCategories.forEach((cat) => cat.classList.remove("active"))
    category.classList.add("active")

    // Show/hide skills
    skillItems.forEach((skill) => {
      skill.classList.remove("active")
      if (skill.classList.contains(targetCategory)) {
        skill.classList.add("active")
      }
    })

    // Animate skill bars for active skills
    setTimeout(() => {
      const activeSkills = document.querySelectorAll(".skill-item.active")
      activeSkills.forEach((skill) => {
        const progress = skill.querySelector(".skill-progress")
        const percentage = skill.getAttribute("data-skill")
        progress.style.width = "0%"
        setTimeout(() => {
          progress.style.width = percentage + "%"
        }, 100)
      })
    }, 300)
  })
})

// Project filtering
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter")

    // Update active filter button
    filterBtns.forEach((button) => button.classList.remove("active"))
    btn.classList.add("active")

    // Filter projects
    projectCards.forEach((card) => {
      if (filter === "all" || card.classList.contains(filter)) {
        card.style.display = "block"
        card.style.animation = "fadeInUp 0.6s ease"
      } else {
        card.style.display = "none"
      }
    })
  })
})

// Contact form handling
contactForm.addEventListener("submit", (e) => {
  e.preventDefault()

  // Get form data
  const formData = new FormData(contactForm)
  const name = formData.get("name")
  const email = formData.get("email")
  const subject = formData.get("subject")
  const message = formData.get("message")

  // Simple validation
  if (!name || !email || !subject || !message) {
    showNotification("Please fill in all fields", "error")
    return
  }

  // Simulate form submission
  showNotification("Message sent successfully!", "success")
  contactForm.reset()
})

// Notification system
function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Style the notification
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        ${type === "success" ? "background: #28a745;" : "background: #dc3545;"}
    `

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Typing effect for hero subtitle
function typeWriter(element, text, speed = 100) {
  let i = 0
  element.textContent = ""

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// Initialize typing effect when page loads
window.addEventListener("load", () => {
  const subtitle = document.querySelector(".hero-subtitle")
  const originalText = subtitle.textContent
  setTimeout(() => {
    typeWriter(subtitle, originalText, 80)
  }, 1000)
})

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset
  const hero = document.querySelector(".hero")
  const rate = scrolled * -0.5

  if (hero) {
    hero.style.transform = `translateY(${rate}px)`
  }
})

// Initialize skill bars animation on page load
window.addEventListener("load", () => {
  setTimeout(() => {
    const activeSkills = document.querySelectorAll(".skill-item.active")
    activeSkills.forEach((skill) => {
      const progress = skill.querySelector(".skill-progress")
      const percentage = skill.getAttribute("data-skill")
      progress.style.width = percentage + "%"
    })
  }, 1500)
})

// Add loading animation
window.addEventListener("load", () => {
  const loader = document.createElement("div")
  loader.className = "loader"
  loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>Loading...</p>
        </div>
    `

  loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.5s ease;
    `

  const spinnerStyle = document.createElement("style")
  spinnerStyle.textContent = `
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader-content {
            text-align: center;
            color: #333;
        }
    `

  document.head.appendChild(spinnerStyle)
  document.body.appendChild(loader)

  setTimeout(() => {
    loader.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(loader)
      document.head.removeChild(spinnerStyle)
    }, 500)
  }, 2000)
})

// Add cursor trail effect
document.addEventListener("mousemove", (e) => {
  const trail = document.createElement("div")
  trail.className = "cursor-trail"
  trail.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX - 3}px;
        top: ${e.clientY - 3}px;
        opacity: 1;
        transition: opacity 0.5s ease;
    `

  document.body.appendChild(trail)

  setTimeout(() => {
    trail.style.opacity = "0"
    setTimeout(() => {
      if (document.body.contains(trail)) {
        document.body.removeChild(trail)
      }
    }, 500)
  }, 100)
})
