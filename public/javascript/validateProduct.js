const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName")
const productError = document.getElementById("productError")
const categorySelect = document.getElementById("firstDropdown")
const brandSelect = document.getElementById("secondDropdown")
const sizeSelect = document.getElementById("thirdDropdown")
const costInput = document.getElementById("costInput")
const sellingPriceInput = document.getElementById("sellingPriceInput")
const actualPriceInput = document.getElementById("actualPriceInput")
const stockInput = document.getElementById("stockInput")
const productDescriptionInput = document.getElementById("productDescriptionInput")


productForm.addEventListener("submit",function(event){
    const product = productName.value
    const category = categorySelect.value
    const brand = brandSelect.value
    const size = sizeSelect.value
    const cost = costInput.value
    const sellingPrice = sellingPriceInput.value
    const actualPrice = actualPriceInput.value
    const stock = stockInput.value
    const description = productDescriptionInput.value

    event.preventDefault();

    if(product.length < 3 || product == ""){
        console.log(product,"dfgsdf");
        productError.textContent = "Please enter a valid product name"
    }
    else if(category == "Select Category"){
        productError.textContent = "Please select a category"
    }
    else if(brand == "Select Brand"){
        event.preventDefault();
        productError.textContent = "Please select a brand"
    }
    else if(size == "Select Size"){
        event.preventDefault();
        productError.textContent = "Please select a size"
    }
    else if(cost < 0 || cost == ""){
        event.preventDefault();
        productError.textContent = "Please enter a valid product cost"
    }
    else if(sellingPrice < 0 || sellingPrice == ""){
        event.preventDefault();
        productError.textContent = "Please enter a valid product selling price"
    }
    else if(actualPrice < 0 || actualPrice == ""){
        event.preventDefault();
        productError.textContent = "Please enter a valid product actual price"
    }
    else if(stock < 0 || stock == ""){
        event.preventDefault();
        productError.textContent = "Please enter a valid product stock"
    }
    else if(description.length < 5 || description == ""){
        event.preventDefault();
        productError.textContent = "Please enter a valid product description"
    }

})