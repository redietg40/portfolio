require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL from .env:', process.env.DATABASE_URL);
console.log('📁 Current directory:', process.cwd());

const express=require('express');
const cors=require('cors');
const { PrismaClient } = require('./generated/prisma');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const app=express();
const port=3000;

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

app.listen(port,()=>{
    console.log(`Portfolio Server is listening on port ${port}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    await pool.end();
});                     