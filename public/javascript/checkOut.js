$(".checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/payment',
        method: 'post',
        data: $('.checkout-form').serialize(),
        success: (res) => {
            if (res.status == 'COD' || res.status == 'WALLET') {
                location.href = '/orderSuccess'
            } else if (res.status == 'ONLINE') {
                razorpayPayment(res.order,res.newOrder)
            }
        }
    })
})

function razorpayPayment(order,newOrder) {
    var options = {
        "key": "rzp_test_sTA223wsPz3BxH", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ForMen",
        "description": "Test Transaction",
        "image": "/images/FORMEN_LOGO.png",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order,newOrder)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}


function verifyPayment(payment, order,newOrder) {
    $.ajax({
        url: '/verifyPayment',
        method: 'post',
        data: {
            payment,
            order,
            newOrder
        },
        success: (res) => {
            if (res.paymentSuccess == true) {
                console.log('near order page');
                location.href = "/orderSuccess"
            } else {
                alert('payment failed')
            }
        }
    })
}