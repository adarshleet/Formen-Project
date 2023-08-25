const loginForm = document.getElementById("loginForm");
const mobileInput = document.getElementById("mobileInput");
const Error = document.getElementById('Error');


loginForm.addEventListener("submit",function(event){
    const mobile = mobileInput.value;
    if(mobile.length<10){
        event.preventDefault();
        Error.textContent = "Please enter a valid mobile number.";
    }
})