const el = document.querySelector('#nbCases');
const dec = document.querySelector('.nbCases-decrement');
const inc = document.querySelector('.nbCases-increment');

const min = el.getAttribute('min');
const max = el.getAttribute('max');

dec.addEventListener('click', decrement);
inc.addEventListener('click', increment);

function decrement() {
    let value = el.value;
    value--;
    if (!min || value >= min) {
        el.value = value;
    }
}

function increment() {
    let value = el.value;
    value++;
    if (!max || value <= max) {
        el.value = value++;
    }
}
