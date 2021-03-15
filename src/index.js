const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find(user => user.username === username);
  if (!user) return res.status(400).json({ error: 'User not found' });

  req.user = user;

  next();
}

function checkExistTodo(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not exists' });

  next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userExists = users.some(user => user.username === username);

  if (userExists) return res.status(400).json({ error: 'User already exists' });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return res.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  if (!title || !deadline) return res.status(400).json({ erro: "Fill all fields" });

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo);

  return res.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { user } = req;
  const {id} = req.params;
  const { title, deadline } = req.body;

  const todo = user.todos.find(todo => todo.id === id);

  todo.title = title ? title : todo.title;
  todo.deadline = deadline ? deadline : todo.deadline;

  return res.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  const done = !todo.done;

  todo.done = done;

  return res.status(200).json(todo);

});


app.delete('/todos/:id', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.findIndex(todo => todo.id === id);

  user.todos.splice(todo, 1);

  return res.status(204).send();

});

module.exports = app;