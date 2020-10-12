function customHttp(){
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code ${xhr.status}`, xhr);
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.send();
            }
            catch(error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error)
            }
        },
    };
}

const http = customHttp();

const newsService = (function(){
    const apiKey = '9d78bfef2acd4296b948a18dd0f28815';
    const apiUrl = 'https://newsapi.org/v2';
    const proxyUrl = "https://cors-anywhere.herokuapp.com/"

    return {
        topHeadlines(country = 'ru', cb) {
            http.get(
                `${proxyUrl}${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb
            );
        },
        everything(query, cb) {
            http.get(
                `${proxyUrl}${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb
            );
        },
    }
})();

const form = document.forms['newsControls'];
const selectCountry = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
})

document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
});

function loadNews() {
    showLoader();
    const country = selectCountry.value;
    const searchText = searchInput.value;

    (!searchText)
        ? newsService.topHeadlines(country, onGetResponse)
        : newsService.everything(searchText, onGetResponse); 

    // if (!searchText) {
    //     newsService.topHeadlines(country, onGetResponse);
    // }
    // else {
    //     newsService.everything(searchText, onGetResponse);
    // }
}

function onGetResponse(err, res) {
    removeLoader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }
    renderNews(res.articles);
}

function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }

    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem); 
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function newsTemplate({ urlToImage, url, title, description }) {
    return `
    <div class='col s6'>
        <div class='card'>
            <div class='card-image'>
                <img src='${urlToImage}'>
                <span class='card-title'>${title || ''}</span>
            </div>
            <div class='card-content'>
                <p>${description || ''}</p>
            </div>
            <div class='card-action'>
                <a href='${url}'>Read more</a>
            </div>
        </div>
    </div>
    `;
}

function showAlert(msg, type = 'success') {
    M.toast({ html: msg, classes: type });
}

function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin', 
        `
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
    `,
    );
}

function removeLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}