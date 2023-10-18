


async function web3main(response){
    let jsonDecode = JSON.parse(response);
    let address = jsonDecode['address'];
    let ABI = jsonDecode['ABI'];
    
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
    }

    let selector = document.getElementById('functionSelector');
    window.contract = await new window.web3.eth.Contract(ABI,address);
    for (var funcName in ABI){
        let func = ABI[funcName];
        var funcexdiv;
        if (func['type'] == 'function'){
            funcexdiv = createFuncExcObj(func);
            selector.appendChild(funcexdiv);
        }
    }
}

function createFuncExcObj(func){
    var mainDiv = document.createElement('div');

    var funcNameTitle = document.createElement('h2');
    funcNameTitle.textContent = func['name'];
    mainDiv.appendChild(funcNameTitle);

    let stateMutabilityTitle = document.createElement('p');
    stateMutabilityTitle.textContent = func['stateMutability'];
    mainDiv.appendChild(stateMutabilityTitle);

    let output_list = document.createElement('ul');
    if (func['outputs'] != null){
        for (let i = 0; i < func['outputs'].length; i++){
            let output = func['outputs'][i];
            let outputTitle = document.createElement('li');
            outputTitle.textContent = output['name'] + ": " + output['type'];

            output_list.appendChild(outputTitle);
        }
    }
    mainDiv.appendChild(output_list);

    for (let i = 0; i < func['inputs'].length; i++){
        let input = func['inputs'][i];
        let inputDiv = document.createElement('div');

        let inputName = document.createElement('p');
        inputName.textContent = input['name']+ ": " + input['type'];

        inputDiv.appendChild(inputName);


        let valueInputField = document.createElement('input');
        valueInputField.setAttribute('type', 'text');
        valueInputField.setAttribute('id', 'VIF_'+input['name']);

        inputDiv.appendChild(valueInputField);
        mainDiv.appendChild(inputDiv);
    }

    
    let executeButton = document.createElement('button');
    executeButton.textContent = "Execute Function " + func['name'];
    executeButton.onclick = async () => {
        //console.log(mainDiv.childNodes);
        await executeWeb3Function(mainDiv);
    }

    mainDiv.appendChild(executeButton);
    return mainDiv;
}

async function executeWeb3Function(mainDiv){
    var arguments = [];
    var funcName = mainDiv.childNodes[0].textContent;
    var funcType = mainDiv.childNodes[1].textContent;
    for (let i = 3; i < mainDiv.childNodes.length - 1; i++){
        let inputDiv = mainDiv.childNodes[i];
        eval(
            'arguments.push(' + inputDiv.childNodes[1].value +");"
        );
    }
    console.log(funcName, funcType, arguments);
    if (funcType == "view" || funcType == "pure"){
        var result = await window.contract.methods[funcName](...arguments).call();
        alert(result);
    }
    else if (funcType == "nonpayable" || funcType == "payable"){
        let account = await getCurrentAccount();
        var result = await window.contract.methods[funcName](...arguments).send({ from: account });
    }
}

async function getCurrentAccount() {
    const accounts = await window.web3.eth.getAccounts();
    return accounts[0];r
}