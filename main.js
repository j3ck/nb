const ROOT_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'ca763fde663d6156c8ba8820c1880a76';


class Api {
  static get api_key() {
    return API_KEY;
  }

  static get root_url() {
    return ROOT_URL;
  }

  static to_param(obj) {
    return Object.keys(obj).map((k) => {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&')
  }

  static async searchMovie(query) {
    const params = { include_adult: false, page: 1, language: 'en-US', api_key: Api.api_key, query: query }
    const url = Api.root_url + '/search/movie?' + Api.to_param(params)

    const response = await fetch(url);
    const json = await response.json();

    return json;
  }
}

const fillTable = (query) => {
  Api.searchMovie(query).then(data => {
    const results_table_body = document.getElementById('results').getElementsByTagName('tbody')[0];
    results_table_body.innerHTML = '';
    data.results.forEach((el) => {
      const row = results_table_body.insertRow(-1);

      ['id', 'title', 'original_language', 'popularity', 'vote_count', 'vote_average', 'release_date'].forEach((key,index) => {
        const cell = row.insertCell(index);
        cell.innerHTML = el[key];
      });
    });
  });
}

const QUERY = 'query=';
const PLUS_REGEXP = /\+/g;

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('#search_form');

  if (window.location.search) {
    const params = window.location.search.substring(1).split('&');
    const query_index = params.findIndex((param) => param.includes(QUERY));
    if (query_index > -1) {
      const query = params[query_index].replace(QUERY, '').replace(PLUS_REGEXP, ' ');
      searchForm.querySelector("input[name='query']").value = query;
      if (query)
        fillTable(query);
    }
  }

  const table = document.getElementById('results');
  const tableHead = table.querySelector('thead')
  const tableHeaders = tableHead.querySelectorAll('th')
  const tableBody = table.querySelector('tbody')

  tableHead.addEventListener('click', (e) => {
    const tableHeader = e.target;
    setOrder(tableHeader);
    const headerIndex = Array.prototype.indexOf.call(tableHeaders,tableHeader);
    sort(tableBody.querySelectorAll('tr'), 'td:nth-child('+(headerIndex+1)+')', tableHeader.dataset.order);
  });
});

const setOrder = (el) => {
  el.parentElement.querySelectorAll('.order').forEach((e) => { e.innerHTML = '' })
  if (el.dataset.order == 'asc') {
    el.querySelector('.order').innerHTML = " <i class='fas fa-angle-up'></i>"
    el.dataset.order = 'desc'
  } else {
    el.querySelector('.order').innerHTML = " <i class='fas fa-angle-down'></i>"
    el.dataset.order = 'asc'
  }
}

const sort = (nodeList, selector, order) => {
  const paraArr = [].slice.call(nodeList).sort((a, b) => {
    if (order == 'asc') {
      return compare(a.querySelector(selector).textContent, b.querySelector(selector).textContent)
    } else {
      return compare(b.querySelector(selector).textContent, a.querySelector(selector).textContent)
    }
  });
  paraArr.forEach((el) => {
    el.parentElement.appendChild(el)
  });
}

const compare = (v1, v2) => {
  return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2);
}
