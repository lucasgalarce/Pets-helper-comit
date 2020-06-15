function filter() {
    window.location.href = `/home?nameFilter=` + document.getElementById('nameFilter').value;
}
function filter2() {
    window.location.href = `/home?placeFilter=` + document.getElementById('nameFilter').value;
}
function filter3() {
    window.location.href = `/home?orderDate=true`;
}