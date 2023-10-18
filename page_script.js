let click_button = document.getElementById("click_button");
let url_input = document.getElementById("url_input_element");

var values = [];
var names = [];
var types = [];

var inFields = [];

click_button.addEventListener(
    "click",
    () => ExploreABI(url_input)
)


function ExploreABI(url_input){
    let url_text = url_input.value;
    let url_parts = url_text.split('/');
    let contract_address = url_parts[url_parts.length - 1];
    let request_url = window.location.href + 'get_abi/' + contract_address;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', request_url);
    xhr.send();
    xhr.onload = () => {
        handleABI(xhr.response);
    }
}

function handleABI(response){
    var innerList = document.getElementById("input_params_list");
    let responseJSON = JSON.parse(response);
    var constructorFields = responseJSON[0]['inputs'];

    for (var i in constructorFields){

        constructorField = constructorFields[i];
        names.push(constructorField['name']);
        types.push(constructorField['type']);
        
        
        let divNote_i = document.createElement('div');
        divNote_i.setAttribute("id", "divNote_"+i);
        
        i++;

        let titleNote_i = document.createElement('p');
        titleNote_i.setAttribute("id", "titleNote_" + i);
        titleNote_i.textContent = constructorField['name'] + ":" + constructorField['type'];
        divNote_i.appendChild(titleNote_i);

        let inField_i = document.createElement('input');
        inField_i.setAttribute("type", "text");
        inField_i.setAttribute("id", "inField_"+i);

        inFields.push(inField_i);
        divNote_i.appendChild(inField_i);

        innerList.appendChild(divNote_i);
        
    }

    let cacButton = document.createElement("button");
    cacButton.setAttribute("id", "CACBUTTON");
    cacButton.addEventListener(
        "click",
        () => {CAC();}
    )
    cacButton.textContent = "Copy and restart Contract";
    document.getElementById("listDiv").appendChild(cacButton);
    console.log('OK');
}

function CAC(){
    let url_text = url_input.value;
    let url_parts = url_text.split('/');
    let contract_address = url_parts[url_parts.length - 1];

    let request_url = window.location.href + 'get/' + contract_address;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', request_url);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = function() {
        console.log("ReadyState for POST request"); 
      }
    xhr.send(JSON.stringify(getArgumentConstructorValues()));
    xhr.onload = () => {
        console.log(xhr.response);
        web3main(xhr.response);
    }
}


function getArgumentConstructorValues(){
    let returnArray = [];
    for (var i = 0; i< names.length; i++){
        let inField = inFields[i]; 
        returnArray.push(inField.value);
    }
    return {'args': returnArray};
}

