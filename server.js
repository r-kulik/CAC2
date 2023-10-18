const fs = require('fs');
const express = require('express');
const { hrtime } = require('process');
const hre = require('hardhat');
const { ethers } = require('hardhat');
const abi = require('ethereumjs-abi');
require('@openzeppelin/test-helpers/configure');
const { exec } = require('child_process');
const { getEnabledCategories } = require('trace_events');
const ETHERSCAN_API_KEY = "5MQAQUQ9BGVJIUKGV46I78QH9AQRUZWKKP";
console.log(ETHERSCAN_API_KEY)
const app = express()
const port = 3000

var bodyParser = require('body-parser');
const { request } = require('http');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.use(express.static(
    'public',
    {
        "maxAge": '0'
    }
    ));
app.get('/', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!' })  
});
app.get('/main.css', (req, res) => {
    res.sendFile(__dirname + '/main.css');
});
app.get('/node_modules/web3/dist/web3.min.js', (req, res) => {
    res.sendFile(__dirname +'/node_modules/web3/dist/web3.min.js');
})
app.get('/web3main.js', (req, res) => {
    res.sendFile(__dirname + '/web3main.js');
})
app.get('/page_script.js', 
        (req, res) => {
            res.sendFile(__dirname + '/page_script.js')
        }
);

app.post(
    '/get/:contract_address/', 
    async (req, res) =>  {
        let contractAddress = req.params['contract_address'];
        console.log("req.body", req.body)
        let constructorRawArguments = req.body.args;
        let constructorArguments = [];
        for (let i = 0; i < constructorRawArguments.length; i++){
            eval("constructorArguments.push("+constructorRawArguments[i]+");");
        }
        console.log("constructor Arguments got from user");
        console.log(constructorArguments);
        let deployed_contract_information = await handleContract(contractAddress, constructorArguments, res);
        console.log("deployed_contract_address", deployed_contract_information);
    }
    
);


app.get("/get_abi/:contract_address",
        async (req, res) => {
            console.log("Getting ABI request");
            let abi = await getContractAbiFromAddress(req.params['contract_address']);
            res.send(abi);
            console.log("response 200");
        })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


async function handleContract(contractAddress, constructorArguments, res){
    let data = await getSourceCodeSaveAndReturnFileNames(contractAddress);
    let contractName = data['contractName'];
    console.log(constructorArguments);
    var ABI = await getContractAbiFromAddress(contractAddress);   
    console.log("ABI BEFORE COMPLILATION:", ABI);
    let deployed_contract_adress = compileAndDeploy(contractAddress, contractName, constructorArguments, res, ABI);
    return deployed_contract_adress;
}

/*async function pullArgumentsFromBinary(ABI, constructorArgumentsBinary){
    
    let constructorArgumentTypes = [];
    let input_types = ABI[0]['inputs'];
    console.log(input_types);
    for (var inputRecord in input_types){
        console.log(inputRecord);
        constructorArgumentTypes.push(input_types[inputRecord]['type']);
    }

    console.log("For this contract we discovered constructor types:");
    console.log(constructorArgumentTypes);
    
    const data = Buffer.from(constructorArgumentsBinary, 'hex');

    var decoded = abi.rawDecode(constructorArgumentTypes, data);
    // console.log(`Decoded: ${JSON.stringify(decoded, null, '  ')}`);
    decoded = await JSON.parse(JSON.stringify(decoded, null, '  '));
    console.log(decoded);
    return decoded;
}*/

async function getContractAbiFromAddress(contractAddress) {
    let urlRequestAdress = "https://api.etherscan.io/"+
    "api?module=contract&action=getabi&address=" + 
    contractAddress + "&apikey=" + ETHERSCAN_API_KEY
    // console.log(urlRequestAdress);
    let response = await fetch(
        urlRequestAdress
    );
    let responseJson = JSON.parse(await response.text());
    let ABI = JSON.parse(responseJson['result']);
    return ABI;
}


async function getSourceCodeSaveAndReturnFileNames(contractAddress){

    let contractNames = [];

    let urlRequestAdress = "https://api.etherscan.io/"+
    "api?module=contract&action=getsourcecode&address=" + 
    contractAddress + "&apikey=" + ETHERSCAN_API_KEY
    // console.log(urlRequestAdress);
    let response = await fetch(
        urlRequestAdress
    );
    let responseJson = JSON.parse(await response.text());
    let contractName = responseJson['result'][0]['ContractName'];
    let sourceTextFiles = JSON.parse(responseJson['result'][0]['SourceCode']);
    for (var sourceTextFile in sourceTextFiles){
        let filename = sourceTextFile;
        contractNames.push(filename);
        let fileText = sourceTextFiles[sourceTextFile]['content'];
        saveFile(filename, fileText);
    }
    let constructorArguments = responseJson['result'][0]['ConstructorArguments'];
    return {'contractName': contractName, 'constructorArguments': constructorArguments};
}


function saveFile(filename, fileText){
    fs.writeFile('contracts/' + filename, fileText, (err) => {if (err) throw err;});
}



async function compileAndDeploy(contractAddress, contractName, constructorArguments, res, ABI){

    console.log("in compile and deploy function:");
    console.log(await constructorArguments);
    fs.writeFile('scripts/'+contractAddress+'.js',
    "async function main() {\n\
        const data = " + JSON.stringify({"name": contractName, "args": await constructorArguments})+";\n\
        let args = process.argv;\n\
        console.log(args);\n\
        const [deployer] = await ethers.getSigners();\n\
        console.log(\"Account:\", deployer.address);\n\
        const token = await ethers.deployContract(data['name'], data['args']);\n\
        console.log(\"Contract address:\", await token.getAddress());\n\
      }\n\
      \n\
      \n\
      main()\n\
        .then(() => process.exit(0))\n\
        .catch((error) => {\n\
          console.error(error);\n\
          process.exit(1);\n\
        });",
        (err) => {if (err) throw err;}
    );

    var spawn = require('child_process').spawn;
    var cp = spawn(process.env.comspec, ['/c', 'npx hardhat compile']);

    cp.stdout.on("data", function(data) {
        console.log(data.toString());
    });

    

    cp.stderr.on("data", function(data) {
        con
        sole.error(data.toString());
    });

    cp.on("exit", (code, signal) => {

        var output = "";
        var cp1 = spawn(process.env.comspec, ['/c', 'npx hardhat run scripts/'+ contractAddress +'.js --network sepolia']);
        var output = "";
        cp1.stdout.on("data", function(data) {
            output += data.toString();
        });

        cp1.stderr.on("data", function(data) {
            console.error(data.toString());
        });

        cp1.on('exit', (code, signal) => {
            console.log("TOTAL OUTPUT OF FUNCTION IS");
            console.log("=========================");
            console.log(output);

            let splitted_message = output.split(" ");
            let address_deployed = splitted_message[splitted_message.length - 1].replace('\n', '');
            
            res.send(
                JSON.stringify(
                    {
                        "address": address_deployed,
                        "ABI": ABI
                    }
                )
            );
            return address_deployed;
        });
});
    
}