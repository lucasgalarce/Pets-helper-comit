const btnSearch = document.getElementById('btn-search');
const name = document.getElementById('search');
const ul = document.getElementById('animal-list')


btnSearch.addEventListener('click', () => {
    let ajaxRequest = new XMLHttpRequest();
    const nameValue = name.value.trim();

    let url = "animal?"

    // Pregunto si el input esta vacio, si tiene valor lo concateno a la url
    if (nameValue != "") {
        url += `name=${nameValue}`;
    }

    ajaxRequest.addEventListener('load', () => {
        if(this.status == 200) {

            ul.innerHTML = "";

            const resultData = JSON.parse(this.responseText);

            resultData.forEach(item => {
                ul.innerHTML += `<li><a href="/animal/${item.id}">Ver información de ${item.name}</a></li>`;
            });
            
        }
    });

    ajaxRequest.open("GET", url);
    ajaxRequest.send();
});