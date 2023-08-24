// Get the data from input field
const mobileInput = document.getElementById('mobileInput');
const mobileError = document.getElementById('mobileError');
const passwordInput = document.getElementById('passwordInput');
const submitButton = document.getElementById('submitButton');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const nameInput = document.getElementById('usernameInput');



//name check 
mobileInput.addEventListener('focus',function() {
    const name = nameInput.value;

    if(name.length < 3){
        // event.preventDefault(); // Prevent form submission
        submitButton.disabled = true; // Disable the submit button
        nameError.textContent = 'Enter Your Fullname';
    }
    else{
        submitButton.disabled = false; // Disable the submit button
        nameError.textContent = '';
    }
})


// Add event listener to password input field - password check
passwordInput.addEventListener('focus', function() {
    const mobileNumber = mobileInput.value;

    if (!validateMobileNumber(mobileNumber)) {
        mobileError.textContent = 'Please enter a valid 10-digit mobile number';
        submitButton.disabled = true; // Disable the submit button
    } else {
        mobileError.textContent = '';
        submitButton.disabled = false; // Enable the submit button
    }

});


// Mobile number validation function - mobile number chehck
function validateMobileNumber(mobileNumber) {
    const mobileRegex = /^\d{10}$/; // Matches exactly 10 digits
    return mobileRegex.test(mobileNumber);
}

// Add event listener to the form submit event
document.getElementById('signup-form').addEventListener('submit', function(event) {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if(password.length < 8 ){
        passwordError.textContent = 'Password must be at least 8 characters long';
        event.preventDefault(); // Prevent form submission
    } 
    else{
        passwordError.textContent = '';
    }

    if(password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        event.preventDefault(); // Prevent form submission
    } 
    else{
        confirmPasswordError.textContent = '';
    }
});