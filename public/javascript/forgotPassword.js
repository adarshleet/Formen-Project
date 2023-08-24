$(document).ready(function() {
    $('#resetPasswordForm').submit(function(e) {
      e.preventDefault(); // Prevent the default form submission
  
      const formData = {
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
        url: '/sendOtpForgot', // Replace with your backend URL
        data: formData,
        success: function(response) {

        if(response.status == 'mobile'){
            $('#warningsMobile').text('Mobile number not exist');
        }

        else if(response.status == true){
            location.href = `/otp_reset_password?mobile=${response.mobile}`
        }

        },
        error: function(error) {
          console.error('Error sending form data:', error);
          // Handle error response here
        }
      });
    });
  });