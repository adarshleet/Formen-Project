$(document).ready(function() {
    $('#changeMobileForm').submit(function(e) {
      e.preventDefault(); // Prevent the default form submission
  
      const formData = {
        password : $('#passwordInputMobile').val(),
        mobile : $('#mobileInput').val()
      };

        if(formData.mobile.length != 10){
            $('#warningsMobile').text('Enter a valid mobile number');
        }
        else{
            $('#warningsMobile').text('');
        }
  
    $.ajax({
        type: 'POST',
        url: '/changeMobile', // Replace with your backend URL
        data: formData,
        success: function(response) {

            

        if(response.status == 'password'){
            $('#warningsMobile').text('Incorrect Password');
        }

        else if(response.status == 'mobile'){
            $('#warningsMobile').text('This Phone is already linked with a existing account');
        }

        else if(response.status == true){
            location.href = `/otpVerify?mobile=${response.mobile}`
        }

        },
        error: function(error) {
          console.error('Error sending form data:', error);
          // Handle error response here
        }
      });
    });
  });