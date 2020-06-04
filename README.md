# Color Keys

Color Keys is a library for creating keys and signing messages on Color Platform network. You can use it to generate keypairs and addresses and to sign messages for the Color Network. 

This library deals with tasks that are considered *security-critical* and should be used very carefully.

## Install

```bash
yarn add @colorplatformjs/color-keys
```

## Usage

### Create a wallet

```js
import { getNewWallet } from "@colorplatformjs/color-keys"

const { ColorAddress, privateKey, publicKey } = getNewWallet()
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Import a seed

```js
import { generateWalletFromSeed } from "@colorplatformjs/color-keys"

const seed = ...24 seed words here

const { ColorAddress, privateKey, publicKey } = generateWalletFromSeed(seed)
// Attention: protect the `privateKey` at all cost and never display it anywhere!!
```

### Sign a message

```js
import { signWithPrivateKey } from "@colorplatformjs/color-keys"

const privateKey = Buffer.from(...)
const signMessage = ... message to sign, generate messages with "@colorplatformjs/color-api"
const signature = signWithPrivateKey(signMessage, privateKey)

```

### Using with Color-API

```js
import { signWithPrivateKey } from "@colorplatformjs/color-keys"
import Color from "@colorplatformjs/color-api"

const privateKey = Buffer.from(...)
const publicKey = Buffer.from(...)

// init Color sender
const Color = Color(REST_SERVER_URL, CHAIN_ID)

// create message
const msg = Color
  .MsgSend({toAddress: 'color1abcd09876', amounts: [{ denom: 'ncolor', amount: 123456789 }})

// create a signer from this local js signer library
const localSigner = (signMessage) => {
  const signature = signWithPrivateKey(signMessage, privateKey)

  return {
    signature,
    publicKey
  }
}

// send the transaction
const { included }= await msg.send({ gas: 200000 }, localSigner)

// await tx to be included in a block
await included()
```
