const express = require("express");
const bodyParser = require("body-parser");

const { Block, Blockchain } = require("./blockchain");

const blockchain = new Blockchain();
blockchain.addBlock(new Block(1, new Date().getTime(), { amount: 4 }));
blockchain.addBlock(new Block(2, new Date().getTime(), { amount: 20 }));
blockchain.addBlock(new Block(3, new Date().getTime(), { data: "saurabh" }));

let app = express();

app.use((req, res, next) => {
  const now = new Date().toString();

  console.log(`${now} ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

app.get("/chain", (req, res) => {
  // uncomment to check validity
  // blockchain.chain[2].data = { data: "hello" };
  res.status(200).send({
    chain: blockchain.chain.slice(1),
    length: blockchain.chain.length - 1
  });
});

app.get("/validity", (req, res) => {
  if (blockchain.isChainValid()) res.status(200).send("Blockchain is valid.");
  else res.status(400).send("Blockchain invalid!");
});

app.get("/mine", (req, res) => {
  blockchain.makeChainValid();
  res.status(200).send("Chain is validated");
});

app.post("/newblock", (req, res) => {
  const index = blockchain.chain[blockchain.chain.length - 1].index + 1;
  const data = req.body.data;
  const previousHash = blockchain.chain[blockchain.chain.length - 1].hash;
  const newBlock = new Block(index, new Date().getTime(), data, previousHash);
  blockchain.addBlock(newBlock);

  if (blockchain.isChainValid()) res.status(201).send(newBlock);
  else res.status(400).send("Blockchain invalid");
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
