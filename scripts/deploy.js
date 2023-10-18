async function main() {
  const data = {}
  console.log(args);
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  const token = await ethers.deployContract(data['name'], data['args']);
  console.log("Token:", await token.getAddress());
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });