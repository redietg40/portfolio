require('dotenv').config();
const express=require('express');
const cors=require('cors');
const { PrismaClient } = require('./generated/prisma');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const app=express();
const port=3000;

// Simple in-memory store for verification tokens (demo only).
// For production use a persistent store (DB) and rate-limiting.
const emailVerifications = new Map();
const crypto = require('crypto');
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.warn('nodemailer not installed. Verification emails will not be sent. Install with `npm i nodemailer`');
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

app.use(cors());    
app.use(express.json());

// Serve static files (HTML, CSS, JS) from parent directory and portfolio-ui
const path = require('path');
app.use(express.static(path.join(__dirname, '..')))
app.use(express.static(path.join(__dirname, '..', '..', 'portfolio-ui')))
app.use('/images', express.static(path.join(__dirname, '..', '..', 'images')))

// Health check
app.get('/',(req,res)=>{
    res.send('Portfolio Server is running');
});

// GET endpoints - Public API
// Combined portfolio endpoint for admin panel
app.get('/api/portfolio', async (req,res)=>{
    try {
        const about = await prisma.about.findFirst();
        const skills = await prisma.skill.findMany();
        const projects = await prisma.project.findMany();
        res.json({
            success: true,
            about: about?.text || "",
            skills: skills,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch portfolio data', details: error.message});
    }
});

app.get('/api/about', async (req,res)=>{
    try {
        const about = await prisma.about.findFirst();
        res.json({success:true, about: about?.text || "No about text available"});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch about text', details: error.message});
    }
});

app.get('/api/skills', async (req,res)=>{
    try {
        const skills = await prisma.skill.findMany();
        res.json({success:true, skills});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch skills', details: error.message});
    }
});

app.get('/api/projects', async (req,res)=>{
    try {
        const projects = await prisma.project.findMany();
        res.json({success:true, projects});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch projects', details: error.message});
    }
});

// Admin endpoints - About
app.put('/api/admin/about', async (req,res)=>{
    try {
        // Support both 'text' and 'about' field names
        const text = req.body.text || req.body.about;
        if(!text){
            return res.status(400).json({error:'About text is required'});
        }
        const existing = await prisma.about.findFirst();
        let about;
        if (existing) {
            about = await prisma.about.update({
                where: { id: existing.id },
                data: { text }
            });
        } else {
            about = await prisma.about.create({
                data: { text }
            });
        }
        res.json({success:true, about: about.text});
    } catch (error) {
        res.status(500).json({error: 'Failed to update about text', details: error.message});
    }
});

// Admin endpoints - Skills
app.post('/api/admin/skills', async (req,res)=>{
    try {
        const {name, percentage, icon, category}=req.body;
        if(!name || percentage === undefined || !icon){
            return res.status(400).json({error:'Name, percentage and icon are required'});
        }
        const newSkill = await prisma.skill.create({
            data: { name, percentage, icon, category: category || '' }
        });
        res.json({success:true, skill: newSkill});
    } catch (error) {
        res.status(500).json({error: 'Failed to create skill', details: error.message});
    }
});

app.get('/api/admin/skills', async (req,res)=>{
    try {
        const skills = await prisma.skill.findMany();
        res.json({success:true, skills});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch skills', details: error.message});
    }
});

app.put('/api/admin/skills/:id', async (req,res)=>{
    try {
        const {id} = req.params;
        const {name, percentage, icon, category}=req.body;
        const updatedSkill = await prisma.skill.update({
            where: { id: parseInt(id) },
            data: { name, percentage, icon, category: category || '' }
        });
        res.json({success:true, skill: updatedSkill});
    } catch (error) {
        res.status(500).json({error: 'Failed to update skill', details: error.message});
    }
});

app.delete('/api/admin/skills/:id', async (req,res)=>{
    try {
        const {id} = req.params;
        await prisma.skill.delete({
            where: { id: parseInt(id) }
        });
        res.json({success:true, message: 'Skill deleted successfully'});
    } catch (error) {
        res.status(500).json({error: 'Failed to delete skill', details: error.message});
    }
});

// Admin endpoints - Projects
app.post('/api/admin/projects', async (req,res)=>{
    try {
        const {name, description, liveUrl, image, githubUrl}=req.body;    
        if(!name || !description || !liveUrl || !image){
            return res.status(400).json({error:'Name, description, liveUrl and image are required'});
        }
        const newProject = await prisma.project.create({
            data: { name, description, liveUrl, image, githubUrl: githubUrl || null }
        });
        res.json({success:true, project: newProject});
    } catch (error) {
        res.status(500).json({error: 'Failed to create project', details: error.message});
    }
});

app.get('/api/admin/projects', async (req,res)=>{
    try {
        const projects = await prisma.project.findMany();
        res.json({success:true, projects});
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch projects', details: error.message});
    }
});

app.put('/api/admin/projects/:id', async (req,res)=>{
    try {
        const {id} = req.params;
        const {name, description, liveUrl, image, githubUrl}=req.body;
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: { name, description, liveUrl, image, githubUrl: githubUrl || null }
        });
        res.json({success:true, project: updatedProject});
    } catch (error) {
        res.status(500).json({error: 'Failed to update project', details: error.message});
    }
});

app.delete('/api/admin/projects/:id', async (req,res)=>{
    try {
        const {id} = req.params;
        await prisma.project.delete({
            where: { id: parseInt(id) }
        });
        res.json({success:true, message: 'Project deleted successfully'});
    } catch (error) {
        res.status(500).json({error: 'Failed to delete project', details: error.message});
    }
});

// ============================================
// Contact Form Endpoints
// ============================================

// POST - Submit a new contact message (Public)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and message are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address'
            });
        }

        // Sanitize inputs (basic XSS prevention)
        const sanitize = (str) => {
            if (typeof str !== 'string') return '';
            return str.replace(/<[^>]*>/g, '').trim();
        };

        const newContact = await prisma.contact.create({
            data: {
                name: sanitize(name),
                email: sanitize(email),
                message: sanitize(message),
            }
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!',
            contact: {
                id: newContact.id,
                name: newContact.name,
                createdAt: newContact.createdAt
            }
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================
// Email verification endpoints (demo)
// POST /verify-email  -> sends verification email with token link
// GET  /verify-email?token=... -> marks email as verified (clicked link)
// GET  /verify-status?email=... -> returns JSON { verified: true|false }
// ============================================

app.post('/verify-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ success: false, error: 'Invalid email format' });

        // Generate a token and expiry (15 minutes)
        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = Date.now() + 15 * 60 * 1000;

        emailVerifications.set(token, { email, verified: false, expiresAt });

        const verifyUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;

        // Send email if nodemailer available
        if (nodemailer) {
            // Configure transporter using environment variables
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.example.com',
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: process.env.SMTP_USER
                    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                    : undefined,
            });

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'no-reply@example.com',
                to: email,
                subject: 'Please verify your email address',
                text: `Click the link to verify your email: ${verifyUrl}`,
                html: `<p>Click the link to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (sendErr) {
                console.error('Failed to send verification email:', sendErr.message);
                // Still return success to avoid leaking which emails are valid.
            }
        } else {
            console.log('Verification link (nodemailer not installed):', verifyUrl);
        }

        // For demo, return token expiry (do not return token in production)
        return res.json({ success: true, message: 'Verification email sent (check inbox)', expiresAt });
    } catch (err) {
        console.error('verify-email error:', err);
        return res.status(500).json({ success: false, error: 'Internal error' });
    }
});

app.get('/verify-email', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send('Missing token');

    const entry = emailVerifications.get(token);
    if (!entry) return res.status(400).send('Invalid or expired token');

    if (entry.expiresAt < Date.now()) {
        emailVerifications.delete(token);
        return res.status(400).send('Token expired');
    }

    entry.verified = true;
    // You may persist this verification to DB here

    // Simple confirmation page
    res.send(`<html><body><h2>Email verified</h2><p>The email ${entry.email} has been verified successfully.</p></body></html>`);
});

app.get('/verify-status', (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    // Search for any token entry for this email and return verified status
    for (const [token, entry] of emailVerifications.entries()) {
        if (entry.email === email) {
            // If expired, delete
            if (entry.expiresAt < Date.now()) {
                emailVerifications.delete(token);
                continue;
            }
            return res.json({ success: true, verified: !!entry.verified });
        }
    }

    return res.json({ success: true, verified: false });
});

app.listen(port,()=>{
    console.log(`Portfolio Server is listening on port ${port}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    await pool.end();
});               