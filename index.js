const express = require("express");

const jwt = require("jsonwebtoken");
const { restart, addListener } = require("nodemon");
const { pool } = require("./data/data");
const app = express();
app.use(express.json());
app.listen(8080, () => {
    console.log("O servidor está ativo na porta 8080!");
});

app.get("/", async (req, res) => {
    try {
        const {id, name, password} = req.user;
        res.status(200).send("Home Page");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});

const senha = "MinhaSenha";

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    
    if (!token) {
        res.status(401).json({ message:'Token não fornecido!'})    
    }
    try{
        const decodificado = jwt.verify(token, senha);
        req.user = decodificado;
        next()
    }catch (err){
        res.status(403).json({message:'Token inválido!'});
    }
}

app.post("/login", (req,res) => {
    const user = {
        id: 123,
        name: 'Lauany',
        password: '12345',
    }
    const token = jwt.sign(user, senha);
    res.status(200).json({token});
})

app.get("/login", verifyToken, (req, res) => {

    const {id, name, password} = req.user;
    res.status(200).json({id, name, password})
})

app.get("/Users", async (req, res) => {
    try {
        const client = await pool.connect();
        const {rows} = await client.query ("SELECT * FROM Users");
        console.table(rows);
        res.status(200).send(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});
app.post("/Users", async (req, res) => {
    try{
        const client = await pool.connect();
        const { id, nome } = req.body;
        const { rows } = await client.query ("INSERT INTO users (id, nome) VALUES ($1,  $2)", [id, nome]);
        console.table(rows);
        res.status(200).send(`Usuário criado com sucesso!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});
app.put("/Users/:id", async (req, res) => {
    try{
        const client = await pool.connect();
        const { id, nome } = req.body;
        console.log(id, nome);
        const { rows } = await client.query('UPDATE users SET nome = $1 WHERE id = $2',[nome, id]);
        console.table(rows);
        res.status(200).send(`Usuário alterado com sucesso!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});
app.delete("/Users/:id", async (req, res) => {
    try{
        const client = await pool.connect();
        const { id } = req.body;
        const { rows } = await client.query ('DELETE FROM users WHERE id = $1', [id]);
        console.table(rows);
        res.status(200).send(`Usuário deletado com sucesso!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
});