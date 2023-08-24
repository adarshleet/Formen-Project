{
    const mainImage = document.querySelector('.main-image3');
    const img = document.getElementById('main-img3');
    
    mainImage.addEventListener('mousemove', zoomIn);
    mainImage.addEventListener('mouseleave', zoomOut);
    
    function zoomIn(event) {
        const boundingRect = mainImage.getBoundingClientRect();
        const mouseX = event.clientX - boundingRect.left;
        const mouseY = event.clientY - boundingRect.top;
    
        const offsetX = (mouseX / boundingRect.width) * 100;
        const offsetY = (mouseY / boundingRect.height) * 100;
    
        img.style.transformOrigin = `${offsetX}% ${offsetY}%`;
        img.style.transform = 'scale(2)'; // Adjust the scale factor as desired
    }
    
    function zoomOut() {
        img.style.transform = 'scale(1)';
    }
    }