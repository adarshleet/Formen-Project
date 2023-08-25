const categoryForm = document.getElementById("categoryForm");
const brandForm = document.getElementById("brandForm")
const sizeForm = document.getElementById("sizeForm")

const categoryInput = document.getElementById("categoryInput")
const categorySelectBrand = document.getElementById("categorySelectBrand")
const categorySelectSize = document.getElementById("categorySelectSize")
const brandInput = document.getElementById("brandInput")
const sizeInput = document.getElementById("sizeInput");

const error = document.getElementById("error")

categoryForm.addEventListener("submit",function(event){
    const category = categoryInput.value
    if(category.length < 3){
        event.preventDefault();
        error.textContent = "Please enter a valid category"
    }
})

brandForm.addEventListener("submit",function(event){
    const categorySelect = categorySelectBrand.value
    const brand = brandInput.value
    if(categorySelect == "Select Category"){
        event.preventDefault();
        error.textContent = "Please select a category"
    }
    else if(brand.length < 1){
        event.preventDefault();
        error.textContent = "Please enter a valid brand"
    }
})

sizeForm.addEventListener("submit",function(event){
    const categorySelect = categorySelectSize.value
    const size = sizeInput.value
    if(categorySelect == "Select Category"){
        event.preventDefault();
        error.textContent = "Please select a category"
    }
    else if(size.length < 1){
        event.preventDefault();
        error.textContent = "Please enter a valid size"
    }
})