function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  const emailForm = document.getElementById("emailForm");
  const emailInput = document.getElementById("emailInput");
  const nameInput = document.getElementById("nameInput")
  const resultElement = document.getElementById("result");

  emailForm.addEventListener("submit", function(event) {

    const name = nameInput.value;
    const emailToValidate = emailInput.value;
    if (!validateEmail(emailToValidate)) {
        event.preventDefault()
        resultElement.textContent = "Invalid email address";
    }
    else if(name.length <4){
        event.preventDefault()
        resultElement.textContent = "Enter the fullname";
    }
  });