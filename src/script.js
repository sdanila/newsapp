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
                `${proxyUrl}${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb
            );
        },
        everything(query, cb) {
            http.get(
                `${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb
            );
        },
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
});

function loadNews() {
    newsService.topHeadlines('ru', onGetResponse);
}

function onGetResponse(err, res) {
    renderNews(res.articles);
}

function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');

    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem); 
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment);
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
