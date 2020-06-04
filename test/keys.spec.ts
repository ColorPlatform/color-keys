import {
  randomBytes,
  getCosmosAddress,
  getNewWalletFromSeed,
  getSeed,
  getNewWallet,
  signWithPrivateKey,
  signWithPrivateKeywallet,
  verifySignature
} from '../src/color-keys'

describe(`Key Generation`, () => {
  it(`randomBytes browser`, () => {
    const crypto = require('crypto')
    const window = {
      crypto: {
        getRandomValues: (array: any[]) => crypto.randomBytes(array.length)
      }
    }
    expect(randomBytes(32, <Window>window).length).toBe(32)
  })

  it(`randomBytes node`, () => {
    expect(randomBytes(32).length).toBe(32)
  })

  it(`randomBytes unsecure environment`, () => {
    jest.doMock('crypto', () => null)

    expect(() => randomBytes(32)).toThrow()
  })

  it(`should create a wallet from a seed`, async () => {
    expect(await getNewWalletFromSeed(`a b c`)).toEqual({
      cosmosAddress: `color1ptw30xjwsn853fn4pnj58a735vq5wxaud4yulw`,
      privateKey: `24d599b1059c86df954e02343bd07e6d0af9cab9511ab71204425b17e330328c`,
      publicKey: `03d55522b27b3cba6d8b6ffa1218b501ce15ac84cd7ad6dec55fb151166be4bce8`
    })
  })

  it(`create a zero seed`, () => {
    expect(
      getSeed(() =>
        Buffer.from(
          Array(64)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toBe(
      `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
    )
  })

  it(`create a seed`, () => {
    // BIP39 test vector (https://github.com/trezor/python-mnemonic/blob/master/vectors.json)
    var entropy = 'f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f'
    expect(getSeed(() => Buffer.from(entropy, 'hex'))).toBe(
      `void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold`
    )
  })

  it(`create a random wallet`, () => {
    expect(
      getNewWallet(() =>
        Buffer.from(
          Array(64)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toEqual({
      cosmosAddress: `color1pfkwh8qwfhxq4py70n8djxnjwuzxunzm7k3utt`,
      privateKey: `f9d76cd16ab9473e48247ec1405075c338ec174543566d58ce4f6c750810606f`,
      publicKey: `02da84e1accf7f6d5260d6f33fca3085d031485f2a5e87efb584e4831e8acaeee9`
    })
  })

  it(`throws an error if entropy function is not producing correct bytes`, () => {
    expect(() =>
      getSeed(() =>
        Buffer.from(
          Array(10)
            .fill(0)
            .join(``),
          'hex'
        )
      )
    ).toThrow()
  })
})

describe(`Address generation`, () => {
  it(`should create correct addresses`, () => {
    const vectors = [
      {
        pubkey: `02da84e1accf7f6d5260d6f33fca3085d031485f2a5e87efb584e4831e8acaeee9`,
        address: `color1pfkwh8qwfhxq4py70n8djxnjwuzxunzm7k3utt`
      },
      {
        pubkey: `02c8f1d2e9713fe128e40ac4abf4bae1f5bee943b9200dabf6c20a1a155ef8ba1b`,
        address: `color1rgsyxufhnnvyylgwpttfstly3ms64kxlyecval`
      }
    ]
    vectors.forEach(({ pubkey, address }) => {
      expect(getCosmosAddress(Buffer.from(pubkey, 'hex'))).toBe(address)
    })
  })
})

describe(`Signing`, () => {
  it(`should create a correct signature`, () => {
    const vectors = [
      {
        // mnemonic: measure slogan connect luggage stereo federal stuff stomach stumble security end differ
        // private key: ea880bbef6bc3dd378b2b43a2b00ad75fbe721556970e73c4b3d02d65ef9ba33
        // public key: 02c8f1d2e9713fe128e40ac4abf4bae1f5bee943b9200dabf6c20a1a155ef8ba1b
        // address: color1rgsyxufhnnvyylgwpttfstly3ms64kxlyecval
        privateKey: `ea880bbef6bc3dd378b2b43a2b00ad75fbe721556970e73c4b3d02d65ef9ba33`,
        signMessage: {
          account_number: '4',
          chain_id: 'localhost-testnet',
          fee: { amount: [{ amount: '37', denom: 'uclr' }], gas: '36977' },
          memo: 'Test signature',
          msgs: [
            {
              type: 'color/MsgSend',
              value: {
                amount: [{ amount: '2000000', denom: 'uclr' }],
                from_address: 'color1rgsyxufhnnvyylgwpttfstly3ms64kxlyecval',
                // This address is for mnemonic: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art
                // In other words, entropy is bytes([0x00] * 32) -- 32 zero
                to_address: 'color1pfkwh8qwfhxq4py70n8djxnjwuzxunzm7k3utt'
              }
            }
          ],
          nonce: '1234567890'
        },
        signature: `1707f00b3459a7a53fa8ea7ee8b7e6e930a387b762c3bc7db7f2698e6aef391f3aedc3e3de896458a2409ced5c60d71faa14cc5d087d2db3b42309f62d7f1d4b`
      }
    ]

    vectors.forEach(({ privateKey, signMessage, signature: expectedSignature }) => {
      const signature = signWithPrivateKey(signMessage, Buffer.from(privateKey, 'hex'))
      // console.log('Signature:', signature.toString('hex'))
      expect(signature.toString('hex')).toEqual(expectedSignature)
    })
  })
})

describe(`Signing`, () => {
  it(`should create a correct signature according to wallet`, () => {
    const vectors = [
      {
        privateKey: `72cec60ccec2c595fb0d15058425e6d097eb0066caa39b12e5c85c56a619d37d`,
        signMessage: {
          message: 'Sahib'
        },
        signature: `Y6SqAjeQw+JJD7RFq3VaSLeFPFc6Y/jfriJNTTraGy0oYxUqE+ZzsEPCdgoOyIuTKGS3Yg1UsCNkmJt9TtH+fjA=`
      }
    ]

    vectors.forEach(({ privateKey, signMessage, signature: expectedSignature }) => {
      const signature = signWithPrivateKeywallet(signMessage, Buffer.from(privateKey, 'hex'))
      expect(signature.toString('base64')).toEqual(expectedSignature)
    })
  })
})

describe(`Verifying`, () => {
  it(`should verify a signature`, () => {
    const vectors = [
      {
        publicKey: `color1d5993rjea7tlyxzrtqqveeuk3m34ef0axd2exr`,
        signMessage: {
          message: 'Sahib'
        },
        signature: `Y6SqAjeQw+JJD7RFq3VaSLeFPFc6Y/jfriJNTTraGy0oYxUqE+ZzsEPCdgoOyIuTKGS3Yg1UsCNkmJt9TtH+fjA=`
      }
    ]

    vectors.forEach(({ publicKey, signMessage, signature }) => {
      const publicKeyBuffer = Buffer.from(publicKey, 'base64')
      const signatureBuffer = Buffer.from(signature, 'base64')
      expect(verifySignature(signMessage, signatureBuffer, publicKeyBuffer)).toEqual(false)
    })
  })

  it(`should fail on invalid signature`, () => {
    const publicKey = `color1d5993rjea7tlyxzrtqqveeuk3m34ef0axd2exr`
    const signature = `Y6SqAjeQw+JJD7RFq3VaSLeFPFc6Y/jfriJNTTraGy0oYxUqE+ZzsEPCdgoOyIuTKGS3Yg1UsCNkmJt9TtH+fjA=`
    const publicKeyBuffer = Buffer.from(publicKey, 'base64')
    const signatureBuffer = Buffer.from(signature, 'base64')
    expect(verifySignature('abcdefg', signatureBuffer, publicKeyBuffer)).toEqual(false)
  })
})
