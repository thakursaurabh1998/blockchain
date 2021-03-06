const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = "";
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block Mined: " + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
  }

  createGenesisBlock() {
    return new Block(0, new Date().getTime(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /* Adding block and mining it */
  addBlock(newBlock) {
    const previousBlock = this.getLatestBlock();
    newBlock.previousHash = previousBlock.hash;
    // console.log(newBlock);
    // newBlock.data.stack = previousBlock.data.stack + newBlock.data.value;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  /* Check validity of the chain */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /* Making chain valid by mining all the blocks */
  makeChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      currentBlock.previousHash = previousBlock.hash;
      currentBlock.hash = currentBlock.calculateHash();

      currentBlock.mineBlock(this.difficulty);
    }
  }

  transaction(category, value, initiated_by, distributed_to = "") {
    const latestBlock = this.getLatestBlock();
    const index = latestBlock.index + 1;
    let information = {
      category,
      initiated_by,
      value
    };
    let stack;
    switch (category) {
      case "donor":
        stack = latestBlock.data.stack + value;
        break;
      case "ngo":
        if (value > latestBlock.data.stack) return false;
        information = {
          ...information,
          distributed_to
        };
        stack = latestBlock.data.stack - value;
        break;
    }

    information = {
      ...information,
      stack
    };
    const newBlock = new Block(index, new Date().getTime(), information);
    this.addBlock(newBlock);

    return newBlock;
  }
}

// let myChain = new Blockchain();

// console.log("Adding and Mining Block 1...");
// myChain.addBlock(new Block(1, new Date().getTime(), { amount: 4 }));
// console.log("Adding and Mining Block 2...");
// myChain.addBlock(new Block(2, new Date().getTime(), { amount: 20 }));
// console.log("Adding and Mining Block 3...");
// myChain.addBlock(new Block(3, new Date().getTime(), { data: "saurabh" }));

// console.log(myChain.isChainValid());

// // console.log(JSON.stringify(myChain.chain, null, 4));

// myChain.chain[2].data = { amount: 100 };

// console.log(myChain.isChainValid());
// // console.log(JSON.stringify(myChain.chain, null, 4));

// myChain.makeChainValid();
// console.log(JSON.stringify(myChain.chain, null, 4));

// console.log(myChain.isChainValid());

module.exports = {
  Block,
  Blockchain
};
