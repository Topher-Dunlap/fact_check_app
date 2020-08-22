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
  $("#show").html('');
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

async function displayResults(responseJson) {
  console.log(responseJson);
  let obj = responseJson;
  let api_data_holder = "";
  let claim_counter = 0;
  // determine length of results and user result input
  if (limit_num > obj.claims.length) {
    limit_num = obj.claims.length;
    console.log(limit_num);
  }
  for (let i = 0; i < limit_num; i++) {
      //Immediately invoked function executable
      let source_name = obj.claims[i].claimReview[0].publisher.name;
      let check_claim = obj.claims[i].claimReview[0].textualRating;
      let source_URL = obj.claims[i].claimReview[0].url;
      let source_title = obj.claims[i].claimReview[0].title;
      //alter source name for url biased scraping
      source_name = source_name.split(' ').join('-');

      //determine if there is a .com or.org at the end of name. If so remove it
      if (source_name.includes(".")) {
        source_name = source_name.substring(0, source_name.length - 4);
      }

      //ajax variables
      let my_url = `https://mediabiasfactcheck.com/${source_name.toLowerCase()}`;
      console.log(source_name);
      var proxy = 'https://arcane-reef-86631.herokuapp.com/';
      
      // This is async, so don't move on until this is done.
      await fetch(proxy + my_url, {}).then(data => {
        if (!data.ok) {
          // Could put a placeholder here for "no information"
          throw new Error("invalid fetch request");
        }
        return data.text();
      }).then(resp => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(resp, 'text/html');
        const allImages = doc.querySelectorAll('h2.entry-title noscript img');
        // Handle the 'no image' problem here.  
        let biasImage = '';
        let ratingImage = '';
        if (allImages.length) {
          biasImage = allImages[0];
          ratingImage = allImages[1];
  
        }
       
        //replace the existing image with the new one
        claim_counter += 1;
        api_data_holder +=
                    `<br>
                  <div class="media">
                    <!-- <img src="..." class="mr-3" alt="..."> -->
                    <div id="claim_container">
                      <h2 class="results-img">
                        Claim #${claim_counter}: <a href="${source_URL}" class="results-img left_align"> ${source_title}</a>
                      </h2>
                      <h2 class="fact_check_color_red">
                      ${source_name} states this claim is: ${check_claim}
                      </h2>
                    </div>
                    <br>
                    <div class="media_bias_container_style">
                      <p class="fact_check_color_green">Source Claim Check is: ${source_name}</p>
                      <h2>"${source_name}" Media Bias Rating: </h2>
                      <div class="media_bias_container_style"></div>
                        <br>
                        <div class="bias_rating_placeholder"></div>
                      <h2>"${source_name}" Factual Reporting Record: </h2>
                        <div class="factual_rating_placeholder"></div>
                          <br>
                        <div>
                          <h4>Bias and factual ratings taken from <a href="${my_url}" class="results-img left_align">Media Bias/Fact Check</a></h4>
                        </div>
                    </div>
                  </div>
                    <br>
                    <hr>
                    <br>
                    `;
  
        //display the results section
        debugger;
        $("#show").html(api_data_holder);

        const bias_rating = document.querySelectorAll('.bias_rating_placeholder')[i];
        const factual_rating = document.querySelectorAll('.factual_rating_placeholder')[i];
        const source_not_found = `Unable to gather media bias info for ${source_name}`;
        if (doc.title == "<p>Page not found - Media Bias/Fact Check</p>") {
          // append means add to it.
          $("#bias_rating_placeholder").appendChild(source_not_found);
          debugger;
          // erase everything in it.
          $("#factual_rating_placeholder").appendChild(source_not_found);
        } 
        else if (bias_rating && factual_rating) {
          bias_rating.appendChild(biasImage);
          factual_rating.appendChild(ratingImage);
        }
      }).catch(_ => {
        console.log('we hit the bottom catch block')
      });
  }
  $("#landing_header").hide();
  $(".results").removeClass("hidden");
  add_user_input(user_input);
  spinner.stop();
  
}
$(function () {
  console.log("App loaded! Waiting for submit!");
  // watchForm();
});