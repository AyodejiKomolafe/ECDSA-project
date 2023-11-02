const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "0x9f19e8f23cce1cc6577e635aeeff10b6e78e5a34": 100,
  "0x4d358b9d4ef14204e25296d3d60417a9aec9e4da": 50,
  "0x44a4bead3965d3b7fed3d81a25426cfb99cdbe13": 75,
};

const privateKeys = {
  "0x9f19e8f23cce1cc6577e635aeeff10b6e78e5a34":
    "8f53c50aebc0ee9240bb1044b7867b14ed494545b845a6a5ec4a4310938815bd",
  "0x4d358b9d4ef14204e25296d3d60417a9aec9e4da":
    "1027f8a3440852c25948408d94238905a5ccf0b938a91c8c5ea904953a08ae9f",
  "0x44a4bead3965d3b7fed3d81a25426cfb99cdbe13":
    "2ca12390ba8c3e5204f28ce04dbfa3d56e7d5253d1265a03565d629fbb9eb722",
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const privateKey = privateKeys[address];
  res.send({ balance, privateKey });
});

app.post("/send", (req, res) => {
  try {
    const { signature, hexMessage, recoveryBit, sender, recipient, amount } = req.body;

    const signaturePublicKey = secp.recoverPublicKey(hexMessage,signature,recoveryBit);
    const signatureAddress = keccak256(signaturePublicKey.slice(1)).slice(-20);
    const signatureAddressHex ="0x" + toHex(signatureAddress);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else if (signatureAddressHex !== sender) {
    res.status(400).send({message: "You are not the sender"});
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
  }
  catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
