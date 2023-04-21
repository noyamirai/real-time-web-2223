const toggleForm = document.querySelector('[data-form-type]');

toggleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const allToggleBtns = document.querySelectorAll('.btn--nav');
    allToggleBtns.forEach(btn => {
        if (btn.className.includes('active')) {
           btn.classList.remove('active'); 
        }
    });

    const buttonClicked = e.submitter;
    buttonClicked.classList.add('active');

    let formId = '[data-game-form]';
    if (buttonClicked.value == 'create-game')
        formId = '[data-nickname-form]';

    const allGameSetupForms = document.querySelectorAll('.form--game-setup');
    allGameSetupForms.forEach(formEl => {
        if (!formEl.className.includes('hide')) {
            formEl.classList.add('hide');
        }
    });

    const relevantFormToShow = document.querySelector(formId);
    relevantFormToShow.classList.remove('hide');

});