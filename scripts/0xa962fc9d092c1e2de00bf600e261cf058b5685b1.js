async function main() {
        const data = {"name":"styleToken","args":[920000000,["0x740b88095be580Da9B7ba4c50df6B51c0140669c"]]};
        let args = process.argv;
        console.log(args);
        const [deployer] = await ethers.getSigners();
        console.log("Account:", deployer.address);
        const token = await ethers.deployContract(data['name'], data['args']);
        console.log("Contract address:", await token.getAddress());
      }
      
      
      main()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });