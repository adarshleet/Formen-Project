// Retrieve the first and second dropdown elements
// const firstDropdown = document.getElementById('firstDropdown');
// const secondDropdown = document.getElementById('secondDropdown');
// const thirdDropdown = document.getElementById('thirdDropdown')
document.addEventListener("click", function(event) {
    // Check if the clicked element has the class "editBtn"
    if (event.target.classList.contains("editBtn")) {
      const productId = document.getElementById("editButton").getAttribute("data-product-id");
    }
  });

  
firstDropdown.addEventListener('change', async () => {
  const selectedValue = firstDropdown.value;

  try {
    // Make an AJAX request to the server to fetch data based on the selected value
    const response = await fetch(`/admin/api/endpoint?selectedValue=${selectedValue}`);
    const data = await response.json();
    // console.log(data.brand);
    const brand = data.brand;
    const size = data.size;
    console.log(size);
   

    // Clear existing options in the second dropdown
    secondDropdown.innerHTML = '';
    thirdDropdown.innerHTML = '';
    // Add new options based on the received data
    brand.forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      secondDropdown.appendChild(option);
    });

    size.forEach((item) => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        thirdDropdown.appendChild(option);
      });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
