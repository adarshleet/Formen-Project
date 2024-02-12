$(document).ready(function () {
    // Add event listener to the button with the "increaseButton" class
    $('.countButton').on('click', function () {
        const clickedButton = this;
        const itemId = clickedButton.dataset.itemId;
        const toDo = clickedButton.dataset.toDo;

        // $(clickedButton).prop('disabled', true);
        // Make the AJAX request to increase the item count
        $.ajax({
            url: `/changeCount/${itemId}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ toDo: toDo }),
            success: function (data) {
                // Update item count on the screen
                console.log(data.count);
                const $countOnScreen = $(`#item_count_${itemId}`);
                $countOnScreen.text(data.count);

                // Update selling price on the screen
                const $sellingPrice = $(`#selling_price_${itemId}`);
                $sellingPrice.text(`Rs ${data.count * data.selling_price}`);

                // Update actual price on the screen
                const $actualPrice = $(`#actual_price_${itemId}`);
                $actualPrice.text(`Rs ${data.count * data.actual_price}`);

                const $message = $(`#message_${itemId}`);
                if (data.status == 'stock') {
                    $message.text('Stock exceeded');
                }
                else if (data.status == 'bag') {
                    $message.text('Bag limit reached');
                }
                else {
                    $message.text('');
                }

                // Update total amount and discount price on the screen
                updateTotalAndDiscount();
                // $(clickedButton).prop('disabled', false);
            },
            error: function (xhr, status, error) {
                console.error('Error occurred during AJAX request:', error);
                // Handle error here if needed
            }
        });
    });


    function updateTotalAndDiscount() {
        let totalMRP = 0;
        let totalDiscountMRP = 0;
        let totalAmount = 0

        $('.item-set').each(function () {
            const $itemSet = $(this);
            const actualPrice = parseInt($itemSet.find('.actualPrice').text().replace('Rs ', ''), 10);
            const sellingPrice = parseInt($itemSet.find('.sellingPrice').text().replace('Rs ', ''), 10);

            totalMRP += actualPrice;
            totalAmount += sellingPrice;
        });

        totalDiscountMRP = totalAmount - totalMRP

        $('#totalMRP').text(totalMRP);
        $('#totalDiscountMRP').text(totalDiscountMRP);
        $('#totalAmount').text(totalAmount);
    }
});