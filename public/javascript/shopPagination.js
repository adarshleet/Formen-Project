$(document).ready(function() {
    $('.page-item').click(function(){
        const clickedButton = this;
        const pageNo = clickedButton.dataset.pageNo;
        const sort = clickedButton.dataset.doSort

        // Get the current URL
        const url = new URL(window.location.href);

        // Check if the "param1" query parameter exists
        if (url.searchParams.has('page') && pageNo !== undefined) {
        // Update the value of "param1"
        url.searchParams.set('page', pageNo);
        } else if(pageNo !== undefined){
        // Add the "param1" query parameter
        url.searchParams.append('page', pageNo);
        }

        if (url.searchParams.has('sort') && sort !== undefined) {
            url.searchParams.set('sort', sort );
          } else if(sort !== undefined) {
            url.searchParams.append('sort', sort );
          }

        window.location.href = url;
    });
});

function handleSelection(){
    
}