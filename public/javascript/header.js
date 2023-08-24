
$(document).ready(function() {
    $(".sidebar-toggler").click(function() {
        $(".sidebar").toggleClass("active");
    });

    $(".close-sidebar-btn").click(function() {
        $(".sidebar").removeClass("active");
    });
});