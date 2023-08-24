$(document).ready(function() {
    $('#apply-coupon').click(function(){
        const coupon = $('#couponInput').val();
        const totalAmound = $('#totalAmount').text();
        const couponDiscount = $('#couponDiscount').text();
        $.ajax({
            url: `/selectCoupon/${coupon}`,
            method:'post',
            dataType: 'json',
            success: function(data){
                if(data.maxDiscount){
                    $('#couponDiscount').text(-data.maxDiscount);
                    $('#totalAmount').text(totalAmound-data.maxDiscount);
                    $('#couponInput').val('');
                    location.reload();
                }
                $('#couponMessage').text(data.message);
            }
        })
    })
})