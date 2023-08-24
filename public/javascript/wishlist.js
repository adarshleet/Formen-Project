$(document).ready(function() {
    // Add event listener to the button with the "toWishlist" class
    $('.toWishlist').on('click', function() {
        const clickedButton = this;
        const itemId = clickedButton.dataset.itemId;
        console.log(itemId);
      // Make the AJAX request to increase the item count
      $.ajax({
        url: `/wishlist/${itemId}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(),
        success: function(data) {
            if(data.success == 'login'){
                window.location.href = '/login'
            }
            else{
                location.reload();
            }
        },
        error: function(xhr, status, error) {
          console.error('Error occurred during AJAX request:', error);
          // Handle error here if needed
        }
      });
    });
});