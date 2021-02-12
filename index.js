const fetch = require("node-fetch");
const currentDate = new Date();

/**
 * @param {int} The month number, 0 based
 * @param {int} The year, not zero based, required to account for leap years
 * @return {Date[]} List with date objects for each day of the month
 */

function getDaysInMonthUTC(month, year) {
    var date = new Date(Date.UTC(year, month, 1));
    var days = [];
    while (date.getUTCMonth() === month) {
        days.push(new Date(date));
        date.setUTCDate(date.getUTCDate() + 1);
    }
    const formattedDays = days.map(day => formatDate(day));
    return formattedDays;
}



function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function getNextDate() {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    let newMonth = currentMonth + 2;
    let newYear = currentYear;
    if (currentMonth == 11) {
        newMonth = 1;
        newYear = currentYear + 1;
    }
    const dateString = `${newYear}-${newMonth}`;
    return new Date(dateString);
}

const nextMonthDate = getNextDate();
const days = getDaysInMonthUTC(nextMonthDate.getMonth(), nextMonthDate.getFullYear());

const requestBody = `{
    "settings" : {
        "number_of_shards" : 1,
        "number_of_replicas" : 1
    },  

    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "user": {
          "properties": {
            "id": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword"
                }
              }
            }
          }
				}
			}
		}
}`;


const data = JSON.stringify(requestBody);

days.forEach(day => {
    const url = 'http://127.0.0.1:9200/SAND2-'+day;
    fetch(url, {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' },
    })
    // .then(res => res.json())
    // .then(json => console.log(json));
    .then(res => {
      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      return res.json();
    })
    .then(json => {
      console.log(json);
    })
    .catch(err => {
      console.error(err);
    })
});

