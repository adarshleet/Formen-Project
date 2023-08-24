
$(document).ready(function() {
    $('.page-item').click(function(){
        const clickedButton = this;
        const pageNo = clickedButton.dataset.pageNo;
        const urlParams = new URLSearchParams(window.location.search);
        let queryString = urlParams.get('search'); 
        queryString = queryString || ''

        // Construct the new URL with the query parameters
        let newURL = '/admin/products?search=' + queryString + '&page=' + pageNo;

        // Redirect the current page to the new URL
        window.location.href = newURL;
    });
});




