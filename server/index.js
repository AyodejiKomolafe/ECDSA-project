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
  "0x5388f0706ed5cad71f2a3680b1a3f501c962225a": 100,
  "0x2582fdc08e8d865d2600ad905df12d1b53ab74d9": 50,
  "0x3221526539db23c99422f8bf50e35c75517893f9": 75,
};

const privateKeys = {
  "0x5388f0706ed5cad71f2a3680b1a3f501c962225a":
    "97e79ce0ef05defbeeee3c59c2298bec144c9559d444873a79d19a5f862aaa16",
  "0x2582fdc08e8d865d2600ad905df12d1b53ab74d9":
    "1a116570141aef0ff07f81eb412fc1244d3cdd62508c99d0d1ee4662ac4725cc",
  "0x3221526539db23c99422f8bf50e35c75517893f9":
    "9ccc5e65a51770f77f83627b6f8976a1a51dd2ee88fea9833b72bbdd3d44c72f",
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const privateKey = privateKeys[address];
  res.send({ balance, privateKey });
});

app.post("/send", async (req, res) => {
  try {
    const { signature, hexMessage, recoveryBit, sender, recipient, amount } =
      req.body;

    const signaturePublicKey = secp.recoverPublicKey(
      hexMessage,
      signature,
      recoveryBit
    );
    const signatureAddress = keccak256(signaturePublicKey.slice(1)).slice(-20);
    const signatureAddressHex = "0x" + toHex(signatureAddress);

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else if (signatureAddressHex !== sender) {
      res.status(400).send({ message: "You are not the sender" });
      console.log(sender);
      console.log(recipient);
      console.log(signatureAddressHex);
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
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
