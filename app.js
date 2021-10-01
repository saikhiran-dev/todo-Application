const format = require("date-fns/format");
var isValid = require("date-fns/isValid");

const path = require("path");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArray = ["WORK", "HOME", "LEARNING"];

const convertTodoDbObjectToResponseDbObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

// 1
app.get("/todos/", async (request, response) => {
  let data = "";
  let getTodosQuery = "";
  const { search_q = "", status, priority, category } = request.query;

  switch (true) {
    //   sc 1
    case status !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND status = '${status}';`;
      if (statusArray.includes(status) === true) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    // sc 2
    case priority !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
      if (priorityArray.includes(priority) === true) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //   sc 3
    case priority !== undefined && status !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            AND status = '${status}';`;
      if (
        priorityArray.includes(priority) === true &&
        statusArray.includes(status) === true
      ) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else if (
        priorityArray.includes(priority) === true &&
        statusArray.some((each) => each !== status)
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        priorityArray.some((each) => each !== priority) &&
        priorityArray.includes(priority) === true
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Status \n Invalid Todo Priority");
      }
      break;
    //   5
    case category !== undefined && status !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND category='${category}' 
            AND status='${status}';`;
      if (
        categoryArray.includes(category) === true &&
        statusArray.includes(status) === true
      ) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else if (
        categoryArray.includes(category) === true &&
        statusArray.some((each) => each !== status)
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (
        categoryArray.some((each) => each !== category) &&
        statusArray.includes(status) === true
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Category \n Invalid Todo Status");
      }
      break;
    //   sc 6
    case category !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND category = '${category}';`;
      if (categoryArray.includes(priority) === true) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //   sc 7
    case category !== undefined && priority !== undefined:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' 
            AND category='${category}' 
            AND priority='${priority}';`;
      if (
        categoryArray.includes(category) === true &&
        priorityArray.includes(priority) === true
      ) {
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) =>
            convertTodoDbObjectToResponseDbObject(dbObject)
          )
        );
      } else if (
        categoryArray.includes(category) === true &&
        priorityArray.some((each) => each !== status)
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        categoryArray.some((each) => each !== category) &&
        priorityArray.includes(status) === true
      ) {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        data = await db.all(getTodosQuery);
        response.status(400);
        response.send("Invalid Todo Category\n Invalid Todo Priority");
      }
      break;
    default:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE search_q = '%${search_q}%';
          `;
      data = await db.all(getTodosQuery);
      response.send(
        data.map((eachTodo) => convertTodoDbObjectToResponseDbObject(dbObject))
      );
  }
});

// 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = '${todoId}';`;
  const dbResponse = await db.get(getTodoQuery);
  response.send(convertTodoDbObjectToResponseDbObject(dbResponse));
});

// 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let getTodoQuery = "";
  const newDate = new Date(date);
  let formatDate = format(new Date(newDate), "yyyy-MM-dd");
  const validDate = isValid(new Date(formatDate));
  if (validDate === true) {
    getTodoQuery = `
        SELECT *
        FROM todo
        WHERE due_date LIKE '%${format(new Date(date), "yyyy-MM-dd")}%';
    `;
    const data = await db.all(getTodoQuery);
    response.send(
      data.map((eachTodo) => convertTodoDbObjectToResponseDbObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const addTodoQuery = `
    INSERT INTO todo (id, todo, priority, status, category, dueDate)
    VALUES (
        ${id}, '${todo}', '${priority}',
        '${status}', '${category}', '${format(new Date(dueDate), "yyyy-MM-dd")}'
    );`;

  const addTodo = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

// 5
// app.put('/todos/:todoId/', async (request, response) => {
//     const {todoId} = request.params;
//     const {status, priority, category, dueDate} = request.body;
//     let updateColumn = '';
//     switch(true){
//         case status !== undefined:
//             updateColumn = "Status Updated"

//     }
// })
