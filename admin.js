// API Base URL - Backend server runs on port 3000
const API_URL = "http://localhost:3000/api"

// State
let currentFilter = "all"
let editingItem = null

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast ${type} show`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Open modal
function openModal(title, content) {
  const modal = document.getElementById("edit-modal")
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = title
  modalBody.innerHTML = content
  modal.classList.add("active")
}

// Close modal
function closeModal() {
  const modal = document.getElementById("edit-modal")
  modal.classList.remove("active")
  editingItem = null
}

// Close modal on outside click
document.getElementById("edit-modal").addEventListener("click", (e) => {
  if (e.target.id === "edit-modal") {
    closeModal()
  }
})

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active button
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")

    // Show corresponding section
    const section = btn.dataset.section
    document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"))
    document.getElementById(`${section}-section`).classList.add("active")
  })
})

// ============================================
// LOAD DATA
// ============================================

async function loadPortfolioData() {
  try {
    const response = await fetch(`${API_URL}/portfolio`)
    const data = await response.json()

    // Load about
    document.getElementById("about-text").value = data.about || ""

    // Load skills
    renderSkills(data.skills || [])

    // Load projects
    renderProjects(data.projects || [])
  } catch (error) {
    console.error("Error loading data:", error)
    showToast("Failed to load data", "error")
  }
}

// ============================================
// ABOUT SECTION
// ============================================

document.getElementById("about-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const aboutText = document.getElementById("about-text").value.trim()

  if (!aboutText) {
    showToast("Please enter about text", "warning")
    return
  }

  try {
    const response = await fetch(`${API_URL}/admin/about`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about: aboutText }),
    })

    const data = await response.json()
    if (response.ok) {
      showToast("About section updated successfully!", "success")
      loadPortfolioData()
    } else {
      throw new Error(data.error || "Failed to update")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast(error.message || "Failed to update about section", "error")
  }
})

// ============================================
// SKILLS SECTION
// ============================================

function renderSkills(skills) {
  const container = document.getElementById("skills-list")

  const filteredSkills = currentFilter === "all" ? skills : skills.filter((s) => s.category === currentFilter)

  if (filteredSkills.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-code"></i>
        <p>No skills found. Add your first skill above!</p>
      </div>
    `
    return
  }

  container.innerHTML = filteredSkills
    .map(
      (skill) => `
    <div class="skill-item" data-id="${skill.id}">
      <div class="skill-header">
        <div class="skill-info">
          <div class="skill-icon">
            <i class="${skill.icon}"></i>
          </div>
          <div>
            <div class="skill-name">${escapeHtml(skill.name)}</div>
            <div class="skill-category">${escapeHtml(skill.category)}</div>
          </div>
        </div>
        <div class="skill-actions">
          <button class="action-btn edit" onclick="editSkill(${skill.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" onclick="deleteSkill(${skill.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="skill-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${skill.percentage}%"></div>
        </div>
        <div class="progress-text">${skill.percentage}%</div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Filter skills
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")
    currentFilter = btn.dataset.filter
    loadPortfolioData()
  })
})

// Add skill
document.getElementById("skill-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const skillData = {
    name: document.getElementById("skill-name").value.trim(),
    percentage: Number.parseInt(document.getElementById("skill-percentage").value),
    icon: document.getElementById("skill-icon").value.trim(),
    category: document.getElementById("skill-category").value,
  }

  if (!skillData.name || !skillData.icon || !skillData.category) {
    showToast("Please fill all fields", "warning")
    return
  }

  try {
    const response = await fetch(`${API_URL}/admin/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillData),
    })

    const data = await response.json()
    if (response.ok) {
      showToast("Skill added successfully!", "success")
      e.target.reset()
      loadPortfolioData()
    } else {
      throw new Error(data.error || "Failed to add skill")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast(error.message || "Failed to add skill", "error")
  }
})

// Edit skill
async function editSkill(id) {
  try {
    const response = await fetch(`${API_URL}/portfolio`)
    const data = await response.json()
    const skill = data.skills.find((s) => s.id === id)

    if (!skill) {
      showToast("Skill not found", "error")
      return
    }

    editingItem = { type: "skill", id }

    const modalContent = `
      <form id="edit-skill-form">
        <div class="form-group">
          <label for="edit-skill-name">Skill Name</label>
          <input type="text" id="edit-skill-name" value="${escapeHtml(skill.name)}" required>
        </div>
        <div class="form-group">
          <label for="edit-skill-percentage">Proficiency (%)</label>
          <input type="number" id="edit-skill-percentage" value="${skill.percentage}" min="0" max="100" required>
        </div>
        <div class="form-group">
          <label for="edit-skill-icon">Icon Class</label>
          <input type="text" id="edit-skill-icon" value="${escapeHtml(skill.icon)}" required>
        </div>
        <div class="form-group">
          <label for="edit-skill-category">Category</label>
          <select id="edit-skill-category" required>
            <option value="frontend" ${skill.category === "frontend" ? "selected" : ""}>Frontend</option>
            <option value="backend" ${skill.category === "backend" ? "selected" : ""}>Backend</option>
            <option value="tools" ${skill.category === "tools" ? "selected" : ""}>Tools</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </form>
    `

    openModal("Edit Skill", modalContent)

    document.getElementById("edit-skill-form").addEventListener("submit", async (e) => {
      e.preventDefault()
      await updateSkill(id)
    })
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to load skill data", "error")
  }
}

async function updateSkill(id) {
  const skillData = {
    name: document.getElementById("edit-skill-name").value.trim(),
    percentage: Number.parseInt(document.getElementById("edit-skill-percentage").value),
    icon: document.getElementById("edit-skill-icon").value.trim(),
    category: document.getElementById("edit-skill-category").value,
  }

  try {
    const response = await fetch(`${API_URL}/admin/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skillData),
    })

    if (response.ok) {
      showToast("Skill updated successfully!", "success")
      closeModal()
      loadPortfolioData()
    } else {
      throw new Error("Failed to update skill")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to update skill", "error")
  }
}

// Delete skill
async function deleteSkill(id) {
  if (!confirm("Are you sure you want to delete this skill?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/admin/skills/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      showToast("Skill deleted successfully!", "success")
      loadPortfolioData()
    } else {
      throw new Error("Failed to delete skill")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to delete skill", "error")
  }
}

// ============================================
// PROJECTS SECTION
// ============================================

function renderProjects(projects) {
  const container = document.getElementById("projects-list")

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <p>No projects found. Add your first project above!</p>
      </div>
    `
    return
  }

  container.innerHTML = projects
    .map(
      (project) => `
    <div class="project-item" data-id="${project.id}">
      <div class="project-image">
        <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.name)}" 
             onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'">
      </div>
      <div class="project-body">
        <h4 class="project-title">${escapeHtml(project.name)}</h4>
        <p class="project-description">${escapeHtml(project.description)}</p>
        <div class="project-links">
          ${
            project.liveUrl && project.liveUrl !== "#"
              ? `
            <a href="${escapeHtml(project.liveUrl)}" class="project-link" target="_blank" rel="noopener noreferrer">
              <i class="fas fa-external-link-alt"></i> Live
            </a>
          `
              : ""
          }
          ${
            project.githubUrl && project.githubUrl !== "#"
              ? `
            <a href="${escapeHtml(project.githubUrl)}" class="project-link" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-github"></i> GitHub
            </a>
          `
              : ""
          }
        </div>
        <div class="project-actions">
          <button class="btn btn-secondary btn-sm" onclick="editProject(${project.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Add project
document.getElementById("project-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const projectData = {
    name: document.getElementById("project-name").value.trim(),
    description: document.getElementById("project-description").value.trim(),
    image: document.getElementById("project-image").value.trim(),
    liveUrl: document.getElementById("project-live").value.trim(),
    githubUrl: document.getElementById("project-github").value.trim(),
  }

  if (!projectData.name || !projectData.description) {
    showToast("Please fill required fields", "warning")
    return
  }

  try {
    const response = await fetch(`${API_URL}/admin/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    })

    const data = await response.json()
    if (response.ok) {
      showToast("Project added successfully!", "success")
      e.target.reset()
      loadPortfolioData()
    } else {
      throw new Error(data.error || "Failed to add project")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast(error.message || "Failed to add project", "error")
  }
})

// Edit project
async function editProject(id) {
  try {
    const response = await fetch(`${API_URL}/portfolio`)
    const data = await response.json()
    const project = data.projects.find((p) => p.id === id)

    if (!project) {
      showToast("Project not found", "error")
      return
    }

    editingItem = { type: "project", id }

    const modalContent = `
      <form id="edit-project-form">
        <div class="form-group">
          <label for="edit-project-name">Project Name</label>
          <input type="text" id="edit-project-name" value="${escapeHtml(project.name)}" required>
        </div>
        <div class="form-group">
          <label for="edit-project-description">Description</label>
          <textarea id="edit-project-description" rows="4" required>${escapeHtml(project.description)}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-project-image">Image URL</label>
          <input type="url" id="edit-project-image" value="${escapeHtml(project.image)}">
        </div>
        <div class="form-group">
          <label for="edit-project-live">Live URL</label>
          <input type="url" id="edit-project-live" value="${escapeHtml(project.liveUrl || "")}">
        </div>
        <div class="form-group">
          <label for="edit-project-github">GitHub URL</label>
          <input type="url" id="edit-project-github" value="${escapeHtml(project.githubUrl || "")}">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </form>
    `

    openModal("Edit Project", modalContent)

    document.getElementById("edit-project-form").addEventListener("submit", async (e) => {
      e.preventDefault()
      await updateProject(id)
    })
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to load project data", "error")
  }
}

async function updateProject(id) {
  const projectData = {
    name: document.getElementById("edit-project-name").value.trim(),
    description: document.getElementById("edit-project-description").value.trim(),
    image: document.getElementById("edit-project-image").value.trim(),
    liveUrl: document.getElementById("edit-project-live").value.trim(),
    githubUrl: document.getElementById("edit-project-github").value.trim(),
  }

  try {
    const response = await fetch(`${API_URL}/admin/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    })

    if (response.ok) {
      showToast("Project updated successfully!", "success")
      closeModal()
      loadPortfolioData()
    } else {
      throw new Error("Failed to update project")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to update project", "error")
  }
}

// Delete project
async function deleteProject(id) {
  if (!confirm("Are you sure you want to delete this project?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/admin/projects/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      showToast("Project deleted successfully!", "success")
      loadPortfolioData()
    } else {
      throw new Error("Failed to delete project")
    }
  } catch (error) {
    console.error("Error:", error)
    showToast("Failed to delete project", "error")
  }
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

async function exportPortfolio() {
  try {
    // Verify data exists
    const response = await fetch(`${API_URL}/portfolio`)
    const data = await response.json()
    
    if (!data.success) {
      showToast("Failed to load portfolio data", "error")
      return
    }
    
    // Open portfolio page in new tab (from portfolio-ui folder)
    window.open("../portfolio-ui/porfolios.html", "_blank")
    showToast("Portfolio page opened in new tab!", "success")
  } catch (error) {
    console.error("Error exporting portfolio:", error)
    showToast("Failed to export portfolio", "error")
  }
}

// ============================================
// UTILITY
// ============================================

function escapeHtml(text) {
  if (!text) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  loadPortfolioData()
})
