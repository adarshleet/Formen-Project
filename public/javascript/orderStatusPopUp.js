// Get the delete button element
const deleteButton = document.querySelectorAll('.deleteButton');
// Get the modal container element
const modalContainer = document.getElementById('modalContainer');
// Get the confirm and cancel button elements inside the modal
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

// Function to show the modal
function showModal() {
    modalContainer.style.display = 'block';
}

// Function to hide the modal
function hideModal() {
    modalContainer.style.display = 'none';
}

function deleteItem(itemId,actionDo) {
    const apiUrl = `/admin/changeOrderStatus?order_id=${itemId}&actionDo=${actionDo}`;
    fetch(apiUrl, { method: 'POST' })
      .then((response) => {
        if (response.ok) {
          // Hide the modal after successful fetch
          hideModal();
  
          // Reload the current page
          window.location.reload();
        } else {
          console.error('Failed to change status.');
        }
      })
      .catch((error) => {
        console.error('Error occurred during fetch:', error);
      });
  }

function handleDeleteButtonClick(event) {
    const clickedButton = event.target;
    const itemId = clickedButton.dataset.itemId;
    const actionDo = clickedButton.dataset.actionDo;
  
    showModal();
    confirmButton.addEventListener('click', () => {
      deleteItem(itemId,actionDo);
      confirmButton.removeEventListener('click', deleteItem);
    });
  }

  deleteButton.forEach((button) => {
    button.addEventListener('click', handleDeleteButtonClick);
  });
  
  cancelButton.addEventListener('click', hideModal);