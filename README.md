# CAC 2

A tool that help you to interact with the smart contracts from Etherscan without writing the code.

### How to install?

Clone this repository to your computer and add 2 files with API keys to interact with services:

1. config.js
```js
const ETHERSCAN_API_KEY = "...";
```
2. hardhat.config.js
```js
require("@nomicfoundation/hardhat-toolbox");
const SEPOLIA_PRIVATE_KEY = "...";
const INFURA_API_KEY = "...";
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
```

### How to run?
If you are on Windows, just run "run.bat"
On linux, in shell, execute 
```shell
node server.js
```

### How to use?

* Open browser at https://localhost:3000
* Enter etherscan URL of contract you want to run in testnet
* After time enter the constructor variables of contract
* Wait for interface to appear
* Chose function to execute, enter its arguments and press the button. The output will appear at alert window.


Please, note, that data should be entered as a code value, therefore, if you are trying to enter address, do not forget to wrap it with quotes, or wrap array with the square brackets.
