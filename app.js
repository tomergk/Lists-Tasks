const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

require("dotenv").config();

// ============ GLOBALS ============
const app = express();
let port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// ============ MONGODB ============

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// =========== TASK ===========

mongoose.set('strictQuery', true);

// Task's schema
const taskSchema = new mongoose.Schema({
  name: String
});

// model of taskSchema
const Task = mongoose.model("Task", taskSchema);

// =========== LIST ===========

// Schema for each list
const listSchema = {
  name: String,
  tasks: [taskSchema]
}

// Model of listSchema
const List = mongoose.model("List", listSchema);

// =========== REQUESTS ===========

// ================ LISTS ================

// #Display all lists.
app.get("/", function (req, res) {
  try {
    List.find({}, function (err, foundLists) {
      if (!err) {
        if (foundLists.length === 0) {
          res.render("home");
        }
        else {
          console.log(`Entering home, Sending the list of lists: ${foundLists}`);
          res.render("home", { lists: foundLists, });
        }
      }
      else {
        console.error(err);
        res.redirect('/');
      }
    }
    )
  }
  catch { }
});

// #Add list
app.post("/add-list", function (req, res) {

  const listName = req.body.newListName;
  const newList = new List({ name: listName, tasks: [] });

  newList.save(function (err) {
    if (!err) {
      console.log(`Added 1 task to DB with the name: ${listName}`);
      console.log(`Redirecting to home.`);
      res.redirect("/");
    }
    else {
      console.error(err)
      res.redirect("/");
    }
  });
});

// #Delete specific list, list's tasks will be deleted too.
app.post("/delete-list", async function (req, res) {
  const listId = req.body.listId;

  try {
    const deletedList = await List.findByIdAndDelete(listId);
    console.log(`Removed list's name: ${deletedList.name}.`);

    if (deletedList) {
      const result = await Task.deleteMany({ _id: { $in: deletedList.tasks } });
      console.log(`Removed ${result.deletedCount} tasks from DB due to deletion of list's name: ${deletedList.name}.`);
    }
  } 
  
  catch (err) {
    console.error("An error occurred:", err);
  }

  console.log(`Redirecting to home.`);
  res.redirect("/");
});

// # Display all tasks of a specific list
app.post("/display-tasks", async function (req, res) {
  const listId = req.body.listId;
  try {
    const list = await List.findById(listId);
    const tasksList = await list.populate('tasks');
    const foundLists = await List.find({});
    res.render('home', { tasks: tasksList.tasks, listId: listId, lists: foundLists, listName: list.name });
  } 
  catch (error) {
    console.error(error);
  }
});

// ================ TASKS ================

// #Add task to a specific list
app.post("/add-task", async function (req, res) {

  const { listId, newTaskName } = req.body;

  try {
    const list = await List.findById(listId);
    const newTask = new Task({
      name: newTaskName
    });

    await newTask.save();

    list.tasks.push(newTask); 

    await list.save();

    try {
      const tasksList = await List.findById(listId).populate('tasks');
      const foundLists = await List.find({});
      res.render('home', { tasks: tasksList.tasks, listId: listId, lists: foundLists, listName: list.name });
    } 
    catch (error) {
      console.error(error);
    }
  }

  catch (error) {
    console.error(error);
    res.status(500).send("Error adding task");
  }
});

// #Delete task from a specific list
app.post("/delete-task", async function (req, res) {
  const { listId, taskId } = req.body;
  try {
    const task = await Task.findById(taskId);
    const list = await List.findById(listId);

    // Remove the task's from the list's "tasks" array
    list.tasks.pull(taskId);
    await list.save();

    await task.remove(); // Delete the task

    try {
      const tasksList = await List.findById(listId).populate('tasks');
      const foundLists = await List.find({});
      res.render('home', { tasks: tasksList.tasks, listId: listId, lists: foundLists, listName: list.name });
    } 
    catch (error) {
      console.error(error);
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Error deleting task");
  }
});



app.listen(port, function () {
  console.log("Server started on port 3000");
});
