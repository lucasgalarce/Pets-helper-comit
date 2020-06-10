const btnSearch = document.getElementById('btn-search');
const name = document.getElementById('search');

btnSearch.addEventListener('click', () => {
    const ajaxRequest = new XMLHttpRequest();
    const nameValue = name.value.trim();

    let url = "animal?"

    // Pregunto si el input esta vacio, si tiene valor lo concateno a la url
    if (nameValue != "") {
        url += `&name=${nameValue}`;
    }

    ajaxRequest.addEventListener('load', () => {
        if(this.status == 200) {
            const resultData = JSON.parse(this.responseText);

            
        }
    });

    ajaxRequest.open("GET", url);
    ajaxRequest.send();
});