$(document).ready(function() {
    function sendDataToServer() {
      const selectedBrands = [];
      $("input[name='brand']:checked").each(function() {
        selectedBrands.push($(this).val());
      });
  
      const selectedCategories = [];
      $("input[name='category']:checked").each(function() {
        selectedCategories.push($(this).val());
      });
      
  
      // Repeat the above code for other fields (price, etc.)
      // ...
  
      const requestData = {
        brands: selectedBrands,
        categories: selectedCategories,
        // Other fields: price, etc.
      };

      console.log(requestData);
  
      $.ajax({
        type: "GET",
        url: "/shop", // Change the URL to your backend endpoint
        data: requestData,
        // contentType: "application/json",
        success: function(response) {
            $("#result").html(response);
        },
        error: function(error) {
          console.error("Error:", error);
        }
      });
    }
  
    // Event listener for brand checkboxes
    $("input[name='brand']").change(sendDataToServer);
  
    // Event listener for category checkboxes
    $("input[name='category']").change(sendDataToServer);
  });