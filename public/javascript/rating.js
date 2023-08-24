const stars = document.querySelectorAll(".stars i");

      stars.forEach((star, index1) => {
        star.addEventListener("click", () => {
          const selectedValue = star.getAttribute("data-value");

          stars.forEach((star, index2) => {
            index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
          });

          const selectedValueInput = document.getElementById("selectedValue");
          selectedValueInput.value = selectedValue;
        });
      });