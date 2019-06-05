const express = require('express');
const app = express();
const routes = express.Router();
const helmet = require('helmet')
const AuthController =  require('./app/controllers/AuthController');
const authMiddleware =  require('./app/middleware/auth');

app.use(helmet())

routes.post("/register", AuthController.register);
routes.post("/login", AuthController.login);

routes.use(authMiddleware);

routes.post("/dashboard", (req, res) => {
    return res.status(200).send();
});

module.exports = routes;