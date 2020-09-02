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
    console.log(res);
}
