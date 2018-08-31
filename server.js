const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const { Block, Blockchain } = require("./blockchain");

const writeJSON = chain => {
  fs.writeFileSync("chain.json", JSON.stringify(chain));
};

const parseJSON = () => {
  try {
    return JSON.parse(fs.readFileSync("chain.json"));
  } catch (error) {
    return [];
  }
};

let blockchain = new Blockchain();

if (blockchain.chain.length === 1) {
  const localFileSystem = parseJSON();
  localFileSystem.chain.splice(0, 1);
  localFileSystem.chain.forEach(e => {
    blockchain.addBlock(new Block(e.index, e.timestamp, e.data));
  });
}

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
  writeJSON(blockchain);
  res.status(200).send("Chain is validated");
});

app.post("/newblock", (req, res) => {
  const index = blockchain.chain[blockchain.chain.length - 1].index + 1;
  const data = req.body.data;
  const newBlock = new Block(index, new Date().getTime(), data);

  blockchain.addBlock(newBlock);

  writeJSON(blockchain);

  if (blockchain.isChainValid()) res.status(201).send(newBlock);
  else res.status(400).send("Blockchain invalid");
});

app.post("/distribute", (req, res) => {
  const { value, initiated_by, distributed_to } = req.body;
  const newBlock = blockchain.transaction(
    "ngo",
    value,
    initiated_by,
    distributed_to
  );
  if (!newBlock)
    res
      .status(403)
      .send(
        "Value shift is greater than stack value, decrease the shift value."
      );
  else res.status(200).send(newBlock);
});

app.post("/donate", (req, res) => {
  const { value, initiated_by } = req.body;
  const newBlock = blockchain.transaction(
    "donor",
    value,
    initiated_by
  );
  if (!newBlock)
    res
      .status(403)
      .send(
        "Value shift is greater than stack value, decrease the shift value."
      );
  else res.status(200).send(newBlock);
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
