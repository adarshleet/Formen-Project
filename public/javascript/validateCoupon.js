const couponForm = document.getElementById("couponForm")
const couponName = document.getElementById("couponName")
const minimumPurchase = document.getElementById("minimumPurchase")
const maximumDiscount = document.getElementById("maximumDiscount")
const couponLastDate = document.getElementById("couponLastDate")
const error = document.getElementById("error")


couponForm.addEventListener("submit",function(event){
    const coupon = couponName.value
    const minPurchase = minimumPurchase.value
    const maxDiscount = maximumDiscount.value
    const date = new Date()
    const lastDate = couponLastDate.value

    // Convert the date strings into Date objects
    const date1 = new Date(date);
    const date2 = new Date(lastDate);

    // Get timestamps for comparison
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();


    if(coupon.length < 3){
        event.preventDefault()
        error.textContent = "Please enter a valid coupon name"
    }
    else if(minPurchase < 1 || minPurchase ==""){
        event.preventDefault()
        error.textContent = "Please enter a valid minimum purchase amount"
    }
    else if(maxDiscount < 1|| maxDiscount == "" ){
        event.preventDefault()
        error.textContent = "Please enter a valid maximun discount amount"
    }
    else if(timestamp2 < timestamp1 || lastDate == ""){
        event.preventDefault()
        error.textContent = "Please enter a valid coupon last date"
    }
    else {
        error.textContent = ""
    }
})