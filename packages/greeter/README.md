# Greeter Tutorial

`greeter` is a simple demo of Arbitrum's L1-to-L2 message passing system (aka "retryable tickets").

It deploys 2 contracts - one to L1, and another to L2, and has the L1 contract send a message to the L2 contract to be executed automatically.

The script and contracts demonstrate how to interact with Arbitrum's core bridge contracts to create these retryable messages, how to calculate and forward appropriate fees from L1 to L2, and how to use Arbitrum's L1-to-L2 message [address aliasing](https://developer.offchainlabs.com/docs/l1_l2_messages#address-aliasing).

See [./exec.js](./scripts/exec.js) for inline explanation.

[Click here](https://developer.offchainlabs.com/docs/l1_l2_messages) for more info on retryable tickets.

### Run Demo:

- Send a message from `L1` to `L2`
```
yarn run greeterFromL1
```

- Send a message from `L2` to `L1`. 

    - Wait more than a day.
    - Get L2 unique withdraw id: 
      - Open scan info of L2 tx -> Event logs: https://testnet.arbiscan.io/tx/0xaea123e8aa36c128ecf2b42ea559ba7cd51845806f41a03c86bcd2e1e75f3391#eventlog
      - Get event L2ToL1Transaction of ArbOS (Topic = 0x5baaa87db386365b5c161be377bc3d8e317e8d98d71a3ca7ed7d555340c8f767) is fine: 0x8a29 = 35369
      - Read value of index 2
      - Check status of unique id here: https://testnet.arbiscan.io/txsExit
    - Get L1 BatchNumber:
      - Read L2 tx event logs => Check Event L2ToL1Transaction of ArbOS => Read value of index 3 => 0x68f = 1679
      - Find L1 Outbox address https://developer.offchainlabs.com/docs/useful_addresses
      - Read L1 Outbox: https://rinkeby.etherscan.io/address/0x2360A33905dc1c72b12d975d975F42BaBdcef9F3#readProxyContract
      - Fill batch number to outboxEntryExists => If it returns true, mean you can execute output to finish the process
    - Execute outbox to complete process on `L1` -> Using `./outbox-execute`

```
yarn run greeterFromL2
```

## Config Environment Variables

Set the values shown in `.env-sample` as environmental variables. To copy it into a `.env` file:

```bash
cp .env-sample .env
```

(you'll still need to edit some variables, i.e., `DEVNET_PRIVKEY`)

<p align="center"><img src="../../assets/offchain_labs_logo.png" width="600"></p>