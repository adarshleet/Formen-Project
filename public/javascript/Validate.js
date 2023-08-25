// Get the data from input field
const mobileInput = document.getElementById('mobileInput');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const Error = document.getElementById('Error');
const nameInput = document.getElementById('nameInput');
const signupForm = document.getElementById("signup-form")



signupForm.addEventListener("submit", function(event) {
    const name = nameInput.value;
    const mobile = mobileInput.value
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    if(name.length < 3){
        event.preventDefault(); // Prevent form submission
        Error.textContent = 'Enter Your Fullname';
    }
    else if (!validateMobileNumber(mobile)) {
        event.preventDefault(); // Prevent form submission
        Error.textContent = 'Please enter a valid 10-digit mobile number';
    }
    else if(password.length < 8 ){
        event.preventDefault(); // Prevent form submission
        Error.textContent = 'Password must be at least 8 characters long';
    } 
    else if(!validateStrongPassword(password)){
        event.preventDefault(); // Prevent form submission
        Error.textContent = "Password must contain at least one symbol, one number, one uppercase letter, and one lowercase letter."
    }
    else if(password !== confirmPassword || confirmPassword.length < 8) {
        event.preventDefault(); // Prevent form submission
        Error.textContent = 'Passwords do not match';
    } 
    
})

// Mobile number validation function - mobile number chehck
function validateMobileNumber(mobile) {
    const mobileRegex = /^\d{10}$/; // Matches exactly 10 digits
    return mobileRegex.test(mobile);
}

//password strong
function validateStrongPassword(password){
    const pattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    return pattern.test(password);
}