const adminForm = document.getElementById("adminForm")
const adminEmail = document.getElementById("adminEmail")
const adminPassword = document.getElementById("adminPassword")
const adminError = document.getElementById("adminError")

adminForm.addEventListener("submit",function(event){
    const email = adminEmail.value
    const password = adminPassword.value

    if(!validateEmail(email)){
        event.preventDefault();
        adminError.textContent = "Please Enter Valid Admin Email"
    }
    else if(email == "" || password == ""){
        event.preventDefault()
        adminError.textContent = "Please Enter Valid Credentials"
    }

    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }
})