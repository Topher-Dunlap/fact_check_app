'use strict';
let spinner;

//variables
const apiKey = 'key=AIzaSyCEUtfNVFpN_JACI-I4Q6ksPJEEiGDK52o';
const searchURL = 'https://content-factchecktools.googleapis.com/v1alpha1/claims:search?';
let langCode = 'languageCode=en';
const queryInput = '';


let user_input = '';
let limit_num = '';
//Functions
$("form").submit((event) => {
  spinner = new Spin.Spinner().spin(document.querySelector('body'));
  event.preventDefault();
  user_input = $('input[type="text"]').val();
  limit_num = $('input[type="number"]').val();
  console.log(user_input);
  console.log(limit_num);
  fetch_api_data(user_input, limit_num);
});


function fetch_api_data(user_input, limit_num = 10) {
  let url = `${searchURL}languageCode=en&query="${user_input}"&pageSize=${limit_num}&maxAgeDays=30&prettyPrint=true&${apiKey}`;
  console.log(url);

  fetch(url)
    .then((response) => response.json())
    .then((responseJson) => displayResults(responseJson))
    .catch(error => alert('Something went wrong. Try again later.'));
}

function add_user_input(u_input) {
  let new_user_input = u_input.toUpperCase();
  let user_input_string = "";
  user_input_string += `<h2 class="results-img"> Results For: '${new_user_input}'</h2>`;
  $("#show").prepend(user_input_string);
}

function displayResults(responseJson) {
  console.log(responseJson);
  let obj = responseJson;
  let api_data_holder = "";
  // determine length of results and user result input
  if (limit_num > obj.claims.length) {
    limit_num = obj.claims.length;
    console.log(limit_num);
  }
  let holder = 0;
  for (let i = 0; i < limit_num; i++) {
    let source_name = obj.claims[i].claimReview[0].publisher.name;
    let check_claim = obj.claims[i].claimReview[0].textualRating;
    let source_URL = obj.claims[i].claimReview[0].url;
    let source_title = obj.claims[i].claimReview[0].title;

    //ajax variables
    let my_url = `https://mediabiasfactcheck.com/${source_name.toLowerCase()}`;
    var proxy = 'https://cors-anywhere.herokuapp.com/';

    fetch(proxy + my_url, {
      // mode: 'no-cors' // 'cors' by default
    }).then(data => {
        return data.text();

    
         
      // let rating_img = $(response.text).find('h2.entry-title');
      // console.log(rating_img);
      // $("#show").load(`https://mediabiasfactcheck.com/${source_name}`, "h2.entry-title");
    }).then(resp => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(resp, 'text/html');
      // h2 with a class entry-title.  Find a descendent of the 2 called noscript.  Find a img underneath the noscript
      const allImages = doc.querySelectorAll('h2.entry-title noscript img');
      const biasImage = allImages[0];
      const ratingImage = allImages[1];
      const empty = document.querySelectorAll('.empty-placeholder')[holder];
      if (empty) {
        empty.appendChild(biasImage);
        empty.appendChild(ratingImage);
      }
      holder += 1;
      console.log(doc);
      debugger;
    });

  
    // fetch(`https://mediabiasfactcheck.com/${source_name}`).then((resp) => {return resp.text(); }).then((resp) => { $(resp).find('h2.entry-title'); });

    //replace the existing image with the new one
    api_data_holder += `<h2 class="results-img">${source_title}:
                        <br>
                    </h2>
                    <h3>Claim Check: ${check_claim}</h3>
                    <p>Source: ${source_name}</p>
                    <a href="${source_URL}" class="results-img">${source_URL}</a>
                    <div class="empty-placeholder"></div>
                    `;
  }
  //display the results section
  $("#show").html(api_data_holder);
  $(".results").removeClass("hidden");
  console.log(user_input);
  add_user_input(user_input);
  spinner.stop();
}

$(function () {
  console.log("App loaded! Waiting for submit!");
  // watchForm();
});