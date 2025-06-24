require("dotenv/config");
require("./db");

// important to import the azureConfig!!
require("./azure/azure.config");
const express = require("express");

const { isAuthenticated } = require("./middleware/jwt.middleware");

const app = express();
require("./config")(app);


// 👇 Start handling routes here

const allRoutes = require("./routes");
app.use("/api", allRoutes);

const videoRoutes = require("./routes/video.routes");
app.use("/api", videoRoutes);

const infinitRouter = require("./routes/infinite.routes");
app.use("/api", infinitRouter);

const blobRouter = require("./routes/blob.routes");
app.use("/api", blobRouter);

const projectRouter = require("./routes/project.routes");
app.use("/api", isAuthenticated, projectRouter);

const taskRouter = require("./routes/task.routes");
app.use("/api", taskRouter);



const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);



require("./error-handling")(app);

module.exports = app;
