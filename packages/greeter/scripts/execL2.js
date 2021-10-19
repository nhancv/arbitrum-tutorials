const hre = require('hardhat')
const ethers = require('ethers')
const {ArbSys__factory, Bridge} = require('arb-ts')
const {hexDataLength} = require('@ethersproject/bytes')
const {arbLog, requireEnvVariables} = require('arb-shared-dependencies')
requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC', 'L1RPC', "INBOX_ADDR"])

/**
 * Instantiate wallets and providers for bridge
 */

const walletPrivateKey = process.env.DEVNET_PRIVKEY

const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2RPC)

const signer = new ethers.Wallet(walletPrivateKey)

const l1Signer = signer.connect(l1Provider)
const l2Signer = signer.connect(l2Provider)

const main = async () => {
  await arbLog('Cross-chain Greeter')
  /**
   * Use wallets to create an arb-ts bridge instance to use its convenience methods
   */
  const bridge = await Bridge.init(l1Signer, l2Signer)

  /**
   * We deploy L1 Greeter to L1, L2 greeter to L2, each with a different "greeting" message.
   * After deploying, save set each contract's counterparty's address to its state so that they can later talk to each other.
   */

  const L1Greeter = await (
    await hre.ethers.getContractFactory('GreeterL1')
  ).connect(l1Signer)

  console.log('Deploying L1 Greeter 👋')
  // const l1Greeter = await L1Greeter.deploy(
  //   'Hello world in L1',
  //   ethers.constants.AddressZero, // temp l2 addr
  //   process.env.INBOX_ADDR
  // )
  // await l1Greeter.deployed()

  // https://rinkeby.etherscan.io/address/0x3724782Ce5B2C86677d23f985524f05116b2752b
  const l1Greeter = await L1Greeter.attach('0x3724782Ce5B2C86677d23f985524f05116b2752b');
  console.log(`deployed to ${l1Greeter.address}`)
  const L2Greeter = await (
    await hre.ethers.getContractFactory('GreeterL2')
  ).connect(l2Signer)

  console.log('Deploying L2 Greeter 👋👋')
  // const l2Greeter = await L2Greeter.deploy(
  //   'Hello world in L2',
  //   ethers.constants.AddressZero // temp l1 addr
  // )
  // await l2Greeter.deployed()

  // https://testnet.arbiscan.io/address/0x3c6c47feF64216822CF6eA3431E9C7f51cDabc57
  const l2Greeter = await L2Greeter.attach('0x3c6c47feF64216822CF6eA3431E9C7f51cDabc57');
  console.log(`deployed to ${l2Greeter.address}`)

  // const updateL1Tx = await l1Greeter.updateL2Target(l2Greeter.address, {
  //   gasLimit: 65716,
  //   gasPrice: ethers.utils.parseUnits('1.00000002', 'gwei')
  // })
  // await updateL1Tx.wait()
  //
  // const updateL2Tx = await l2Greeter.updateL1Target(l1Greeter.address, {
  //   gasLimit: 1511287,
  //   gasPrice: ethers.utils.parseUnits('0.0202', 'gwei')
  // })
  // await updateL2Tx.wait()
  // console.log('Counterpart contract addresses set in both greeters 👍')

  /**
   * Let's log the L2 greeting string
   */
  const currentL2Greeting = await l2Greeter.greet()
  console.log(`Current L2 greeting: "${currentL2Greeting}"`)

  const currentL1Greeting = await l1Greeter.greet()
  console.log(`Current L1 greeting: "${currentL1Greeting}"`)

  //// Request change message from L2
  console.log('Updating greeting from L2 to L1:')

  const newGreeting = 'Greeting from L2 to L1'
  console.log(`newGreeting: ${newGreeting}`)

  const setGreetingTx = await l2Greeter.setGreetingInL1(
    newGreeting, // string memory _greeting,
  )
  const setGreetingRec = await setGreetingTx.wait()

  console.log(
    `Greeting txn confirmed on L2! 🙌 ${setGreetingRec.transactionHash}`
  )

  /**
   * Now when we call greet again, we should see our new string on L1!
   */
  // const newGreetingL1 = await l1Greeter.greet()
  // console.log(`Updated L1 greeting: "${newGreetingL1}"`)
  // console.log('✌️')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// greeter|master⚡ ⇒ yarn run greeterFromL2
// yarn run v1.22.15
// $ hardhat run scripts/execL2.js
// Environmental variables properly set 👍
// Arbitrum Demo: Cross-chain Greeter
// Lets
// Go ➡️
// ...🚀
//
// Deploying L1 Greeter 👋
// deployed to 0x3724782Ce5B2C86677d23f985524f05116b2752b
// Deploying L2 Greeter 👋👋
// deployed to 0x3c6c47feF64216822CF6eA3431E9C7f51cDabc57
// Current L2 greeting: "Greeting from far, far away"
// Current L1 greeting: "Hello world in L1"
// Updating greeting from L2 to L1:
// newGreeting: Greeting from L2 to L1
// Greeting txn confirmed on L2! 🙌 0xaea123e8aa36c128ecf2b42ea559ba7cd51845806f41a03c86bcd2e1e75f3391
// ✨  Done in 20.20s. Sunday, October 17, 2021 10:19:47 PM GMT+07:00
// greeter|master⚡ ⇒

// =========================
// Verify with outbox-execute
// node_modules/.bin/hardhat outbox-exec --txhash 0xaea123e8aa36c128ecf2b42ea559ba7cd51845806f41a03c86bcd2e1e75f3391
// outbox-execute|master⚡ ⇒ node_modules/.bin/hardhat outbox-exec --txhash 0xaea123e8aa36c128ecf2b42ea559ba7cd51845806f41a03c86bcd2e1e75f3391
// Environmental variables properly set 👍
// Arbitrum Demo: Outbox Execution
// Lets
// Go ➡️
// ...🚀
//
// Attempting to query from 0 to block latest
// Waiting for message to be confirmed: Batchnumber: 1679, IndexInBatch 0
// Transaction confirmed! Trying to execute now
// going to get proof
// got proof
// Found outbox entry!
// Transaction hash: 0xe2738f90c4258be99616511256305c9a1f834f0883da97daed302e5c014c8ce2
// Done! Your transaction is executed
// outbox-execute|master⚡ ⇒
