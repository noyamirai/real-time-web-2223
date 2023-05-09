const toggleForm = document.querySelector('[data-form-type]');
const errorMessage = document.querySelector('.error');

toggleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const allToggleBtns = document.querySelectorAll('.btn--nav');
    allToggleBtns.forEach(btn => {
        if (btn.className.includes('active')) {
           btn.classList.remove('active'); 
        }
    });

    if (errorMessage) {
        errorMessage.classList.toggle('hide');   
    }

    const buttonClicked = e.submitter;
    buttonClicked.classList.add('active');

    const formTypeVal = document.querySelector('[data-form_type]');
    formTypeVal.value = (buttonClicked.value == 'create-game' ? 'create': 'join');
    
    const roomCodeSection = document.querySelector('[data-room_code-section]');

    if (buttonClicked.value == 'join-game') {
        roomCodeSection.classList.remove('hide');
        return;
    }

    roomCodeSection.classList.add('hide');

});