const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Task = require("../models/Task.model");
const Project = require("../models/Project.model");

//  POST /api/tasks  -  Creates a new task
router.post("/tasks", async (req, res, next) => {
  const { title, description, projectId } = req.body;

  // Check if title exist
  if( !title || !description || !projectId) {
    res.status(400).json({message: "title, description, or projectId are missing or wrong"});
    return
  }
  // check if token is valid for mongoDB
  const isValid = mongoose.Types.ObjectId.isValid(projectId);
  if(!isValid){
    res.status(400).json({message: "Id is not a valid mongoDB id"})
    return
  }
    try{   
      const task = await Task.create({title, description, projectId})
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $push: { tasks: task._id } },
        { new: true }
      );
      console.log("Updated Project: ", updatedProject);
      res.status(201).json({ task, updatedProject })
      
    }catch(err){
      console.error("Something went wrong when adding task", err)
      res.status(500).json({message: "Interal Server Error"})
    }
});

//  GET /api/tasks/:taskId  - Retrieves a specific task by id
router.get("/tasks/:taskId", (req, res, next) => {
  const { taskId } = req.params;

  Task.findById(taskId)
    .then((task) => res.json(task))
    .catch((error) => res.json(error));
});

// PUT  /api/tasks/:taskId  - Updates a specific task by id
router.put("/tasks/:taskId", (req, res, next) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Task.findByIdAndUpdate(taskId, req.body, { new: true })
    .then((updatedTask) => res.json(updatedTask))
    .catch((err) => res.json(err));
});

//  DELETE /api/tasks/:taskId  - Deletes a specific task by id
router.delete("/tasks/:taskId", (req, res, next) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Task.findByIdAndRemove(taskId)
    .then(() =>
      res.json({ message: `Task with ${taskId} is removed successfully.` })
    )
    .catch((error) => res.json(error));
});

module.exports = router;
