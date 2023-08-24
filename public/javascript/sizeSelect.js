
let selectedButton = null;
const selectedValueInput = document.getElementById("selectedValueInput");

function selectButton(buttonIndex) {
    const buttonContainer = document.getElementById("buttonContainer");
    const buttons = buttonContainer.getElementsByClassName("button");

    if (selectedButton !== null) {
    selectedButton.classList.remove("selected");
    }

    selectedButton = buttons[buttonIndex - 1];
    selectedButton.classList.add("selected");

    const selectedValue = selectedButton.getAttribute("data-value");
    selectedValueInput.value = selectedValue;
}
