

  const addressForm = document.getElementById("addressForm");
  const mobileInput = document.getElementById("mobileInput");
  const nameInput = document.getElementById("nameInput");
  const addressInput = document.getElementById('addressInput');
  const localityInput = document.getElementById("localityInput");
  const pincodeInput = document.getElementById("pincodeInput");
  const districtInput = document.getElementById("districtInput");
  const stateInput = document.getElementById("stateInput");
  const resultElement = document.getElementById("result");

  addressForm.addEventListener("submit", function(event) {

    const name = nameInput.value;
    const mobile = mobileInput.value;
    const address = addressInput.value;
    const locality = localityInput.value;
    const pincode = pincodeInput.value;
    const district = districtInput.value;
    const state = stateInput.value;

    if(name.length <4 || address.length <4 || locality.length <4 || district.length <4){
        event.preventDefault()
        resultElement.textContent = "Enter valid details";
    }
    else if(mobile.length < 10){
        event.preventDefault()
        resultElement.textContent = "Enter valid mobile number";
    }
    else if(pincode.length != 6){
        event.preventDefault()
        resultElement.textContent = "Enter valid pincode";
    }
    else if(state.length <3){
        event.preventDefault()
        resultElement.textContent = "Enter valid state name";
    }
  });