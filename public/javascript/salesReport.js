const reportForm = document.getElementById("salesReportForm")
const startDate = document.getElementById('startDate')
const endDate = document.getElementById('endDate')
const errorMsg = document.getElementById("error-msg")
let endingDate = endDate.value
console.log(endingDate);

reportForm.addEventListener("submit",event=>{
    if(startDate>endDate){
        event.preventDefault()
        errorMsg.textContent = "Select valid dates"
    }
})