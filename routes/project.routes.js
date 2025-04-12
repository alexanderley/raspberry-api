const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");


router.post("/projects", async (req, res, next)=>{
  const {title, description} = req.body;
  try{
    const response = await Project.create({title, description, tasks:[]})
    res.json(response)
  }catch(err){
    console.err('Something went wrong when creating a new Project', err)
    res.json(err)
    res.status(500).json({ message: "Internal Server Error", error: err.message }); 
  }
})

router.get("/projects", async (req, res, next) => {
  try {
    const response = await Project.find().populate("tasks"); 
    res.json(response);
  } catch (err) {
    console.error("Something went wrong when fetching projects from the server:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message }); 
  }
});

router.get("/projects/:projectId", async (req, res, next) => {
  const { projectId } = req.params;

try {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  const project = await Project.findById(projectId).populate("tasks");
  res.status(200).json(project)
} catch(err){
  console.error("Somethign when wrong while fetching projects from the backend", err)
  res.status(500).json({message: "Internal Server Error", error: err.message})
}
});

// PUT  /api/projects/:projectId  -  Updates a specific project by id
router.put("/projects/:projectId", async (req, res, next) => {
  const { projectId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const project = await Project.findByIdAndUpdate(projectId, req.body, { new: true })

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project)
  }catch(err){
    console.error("Something went wrong when updating project routes", err);
    res.status(500).json({message: "Internal Server Error", error: err.message})
  }
});

// DELETE  /api/projects/:projectId  -  Deletes a specific project by id
router.delete("/projects/:projectId", async (req, res, next) => {
  const { projectId } = req.params;

  try{
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
  
  await Project.findByIdAndRemove(projectId)
   res.status(200).json({message: `Project with ${projectId} is removed successfully.`,})
  }
  catch(err){
    console.error(err);
    res.status(500).json({message: "Internal Server Error", error: err.message})
  }
});

module.exports = router;
