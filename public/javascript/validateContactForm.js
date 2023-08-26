const contactForm = document.getElementById("contactForm")
const userName = document.getElementById("userName")
const userMobile = document.getElementById("userMobile")
const userEmail = document.getElementById("userEmail")
const messageToAdmin = document.getElementById("messageToAdmin")
const formError = document.getElementById("formError")

contactForm.addEventListener("submit",function(event){
    const name = userName.value
    const mobile = userMobile.value
    const email = userEmail.value
    const message = messageToAdmin.value

    if(name.length < 3){
        event.preventDefault()
        formError.textContent = "Please Enter Your Fullname"
    }
    else if(mobile.length < 10){
        event.preventDefault()
        formError.textContent = "Please Enter Valid Mobile Number"
    }
    else if(!validateEmail(email)){
        event.preventDefault()
        formError.textContent = "Please Enter Valid Email"
    }
    else if(message.length < 6 || message == ""){
        event.preventDefault()
        formError.textContent = "Please Enter Detailed Reason On Message"
    }
    else{
        formError.textContent = ""
    }



    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }
})