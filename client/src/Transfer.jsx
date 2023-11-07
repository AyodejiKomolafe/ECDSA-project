import { useState } from "react";
import server from "./server";

import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import {toHex} from "ethereum-cryptography/utils";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import secp from "ethereum-cryptography/secp256k1"
import {sign} from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState("");
  const [recoveryBit, setRecoveryBit] = useState("");
  const [hexMessage, setHashedMessage] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function hashAndSign() {
    try {
      const transactionMessage = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient: recipient
      }
      const hashedMessage = keccak256(utf8ToBytes(JSON.stringify(transactionMessage)));
      const hexMessage = toHex(hashedMessage);
      setHashedMessage(hexMessage);
      const signatureArray = await sign(hexMessage, privateKey, {recovered: true });
      const signature = toHex(signatureArray[0]);
      setSignature(signature);
      const recoveryBit = signatureArray[1];
      setRecoveryBit(recoveryBit);
    }
    catch (error) {
      console.log(error);
      alert(error);
    }
  };

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        recoveryBit,
        hexMessage
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>
      <input type="button" className="button" value= "Sign the transaction" onClick={hashAndSign}></input>

      <div>Transaction hash: {hexMessage}</div>
      <div>Signature: {signature.slice(0,4)}...{signature.slice(-4)}</div>
      <div>Recovery Bit: {recoveryBit}</div>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
