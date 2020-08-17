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


function fetch_api_data(user_input, limit_num = 5) {
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
  user_input_string += `<br> <h2 class="results-img left_align"> Results For: '${new_user_input}'</h2>`;
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

    //alter source name for url biased scraping
    source_name = source_name.split(' ').join('-');
    //determine if there is a .com or.org at the end of name. If so remove it
    if (source_name.includes(".")) {
      source_name = source_name.substring(0, source_name.length - 4);
      console.log(source_name);
    }

        //ajax variables
        let my_url = `https://mediabiasfactcheck.com/${source_name.toLowerCase()}`;
        console.log(source_name);
        var proxy = 'https://arcane-reef-86631.herokuapp.com/';
        // var proxy = 'https://cors-anywhere.herokuapp.com/';

        fetch(proxy + my_url, {
        }).then(data => {
          return data.text();
        }).then(resp => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(resp, 'text/html');
          // const not_found = "<p> Bias Rating Not Found </p>"
          // h2 with a class entry-title.  Find a descendent of the 2 called noscript.  Find a img underneath the noscript
          const allImages = doc.querySelectorAll('h2.entry-title noscript img');
          const biasImage = allImages[0];
          const ratingImage = allImages[1];
          const bias_rating = document.querySelectorAll('.bias_rating_placeholder')[holder];
          const factual_rating = document.querySelectorAll('.factual_rating_placeholder')[holder];
          if (bias_rating && factual_rating) {
            bias_rating.appendChild(biasImage);
            factual_rating.appendChild(ratingImage);
          }
          holder += 1;
          console.log(doc);
        });

        //replace the existing image with the new one
        api_data_holder += 
                    `<br>
                    <hr>
                    <h2 class="results-img">
                      Claim: <a href="${source_URL}" class="results-img left_align"> ${source_title}</a>
                    </h2>
                    <h3>Claim Check: ${check_claim}</h3>
                    <br>
                    <br>
                    <p>Fact Checking Source: ${source_name}</p>
                    <h2>"${source_name}" Media Bias Rating: </h2>
                    <div class="bias_rating_placeholder"></div>
                    <h2>"${source_name}" Factual Reporting Record: </h2>
                    <div class="factual_rating_placeholder"></div>
                    <br>
                    <div>
                      Bias and factual ratings taken from <a href="${my_url}" class="results-img left_align">Media Bias/Fact Check</a>
                    </div>
                    <br>
                    <br>
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