$(document).on("click", ".popupBTN", () => {
    var cId = $(this).data('id');
    $(".modal-body #catID").val(cId);
    console.log(cId);
});


// document.addEventListener("click", async function(event) {
//     if (event.target.classList.contains("popupBTN")) {
//       var cId = event.target.dataset.id;
//       console.log(cId);

//       const response = await fetch(`/admin/api/getProduct?id=${cId}`);
//         const data = await response.json();
//         console.log(data.name);
//         const name =data.name
//         document.getElementById("product-name").value = name
//         // productname.innerHTML='';
//         // console.log(productname);
//         // productname.appendChild(data.name)
//     }})