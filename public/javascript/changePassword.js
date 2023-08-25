$(document).ready(function() {
    $('#myForm').submit(function(e) {
      e.preventDefault(); // Prevent the default form submission
  
      const formData = {
        currentPassword: $('#currentPasswordInput').val(),
        password : $('#passwordInput').val(),
        confirmPassword : $('#confirmPasswordInput').val()
      };

      
  
      $.ajax({
        type: 'POST',
        url: '/changePassword', // Replace with your backend URL
        data: formData,
        success: function(response) {
          if(response.status == 'empty'){
            $('#warnings').text('All fields are required');
          }
          else if(response.status == 'different'){
            $('#warnings').text('Password doesnot match');
          }
          else if(response.status == 'not Match'){
            $('#warnings').text('Current password incorrect');
          }
          else if(formData.password.length <8){
            $('#warnings').text('Password length minimum 8 characters');
          }
          else if(!validateStrongPassword(formData.password)){
            $('#warnings').text("Password must contain at least one symbol, one number, one uppercase letter, and one lowercase letter.");
          }
          else if(response.status == 'done'){
            $('#staticBackdrop').modal('hide');
            // $('#changed').text('Password Changed successfully')
            const notification = document.getElementById('notification');
            $('#notification').text('Password changed successfully');
            // Show the notification
            notification.style.right = '10px';
      
            // Set a timeout to hide the notification after 3 seconds (adjust as needed)
            setTimeout(function () {
              notification.style.right = '-250px';
            }, 3000);

        }
        //password strong
        function validateStrongPassword(password){
          const pattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
          return pattern.test(password);
        }
        },
        error: function(error) {
          console.error('Error sending form data:', error);
          // Handle error response here
        }
      });
    });
  });