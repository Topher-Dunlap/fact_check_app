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
  number_needed(limit_num);
  fetch_api_data(user_input, limit_num);
});


function fetch_api_data(user_input, limit_num = 5) {
  let url = `${searchURL}languageCode=en&query="${user_input}"&pageSize=${limit_num}&maxAgeDays=30&prettyPrint=true&${apiKey}`;
  console.log(url);

  fetch(url)
    .then((response) => response.json())
    .then((responseJson) => displayResults(responseJson))
    .catch(error =>  {
      spinner.stop();
      alert('Something went wrong. Try again later.')
    });
}

function add_user_input(u_input) {
  let new_user_input = u_input.toUpperCase();
  let user_input_string = "";
  user_input_string += `<br> <h3 class="results-img left_align"> ${limit_num} results for: '${new_user_input}'</h3>`;
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
  }
  for (let i = 0; i < limit_num; i++) {
    //Immediately invoked function executable
    let source_name = obj.claims[i].claimReview[0].publisher.name;
    let check_claim = obj.claims[i].claimReview[0].textualRating;
    let source_URL = obj.claims[i].claimReview[0].url;
    let claimant = obj.claims[i].claimant;
    if (claimant == undefined) {
      claimant = "<br> <h4>- Unable to determine source of claim.</h4>";
      }
    else {
      claimant = "-" + claimant;
    }
    let source_title = obj.claims[i].text;
    // let source_title = obj.claims[i].claimReview[0].title;
    // if (source_title == undefined) {
    //   source_title = obj.claims[i].text;
    // }
    //alter source name for url biased scraping
    source_name = source_name.split(' ').join('-');

    //determine if there is a .com or .org at the end of name. If so remove it
    if (source_name.includes(".")) {
      source_name = source_name.substring(0, source_name.length - 4);
    }

    //ajax variables
    let my_url = `https://mediabiasfactcheck.com/${source_name.toLowerCase()}`;
    var proxy = 'https://arcane-reef-86631.herokuapp.com/';

      //replace the existing image with the new one
      claim_counter += 1;
      api_data_holder +=
        `<br>
                <div class="card media round_box_corners_top">
                  <div class="card-body" id="claim_container">
                    <h4 class="badge badge-warning">Claim #${claim_counter}:</h4>
                    <h2 class="card-title">"${source_title}" ${claimant}</h2>
                    <h3 class="fact_check_color_red"> ${source_name} states this claim is: ${check_claim}</h3>
                    <a href="${source_URL}" class="btn btn-primary button_bottom_margin mx-auto button_margin_left">${source_name} Assessment</a>
                  </div>
                </div>
                    <br>
                  <div class="card media_bias_container_style text-center">
                    <div class="card-body">
                      <p class="card-text fact_check_color_red"> Claim Check by: ${source_name}</p>
                      <h2 class="card-title">"${source_name}" Media Bias Rating: </h2>
                        <div class="media_bias_container_style"></div>
                      <br>
                        <div class="bias_rating_placeholder"></div>
                      <h2>"${source_name}" Factual Reporting Record: </h2>
                        <div class="factual_rating_placeholder"></div>
                      <br>
                      <div>
                        <h4>Bias and factual ratings taken from  <a href="${my_url}" class="btn btn-primary results-img">Media Bias/Fact Check</a></h4>
                      </div>
                    </div>
                  </div>
                    `;

      //display the results section
      $("#show").html(api_data_holder);

       // This is async, so don't move on until this is done.
    await fetch(proxy + my_url, {}).then(data => {
      debugger;
      if (!data.ok) {
        // Could put a placeholder here for "no information"
        console.log("404 error")
        throw new Error("invalid fetch request");
        const source_not_found = `Unable to gather media bias info for ${source_name}`;
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
    }).catch(_ => {
      console.log('we hit the bottom catch block')
    });
    const bias_rating = document.querySelectorAll('.bias_rating_placeholder')[i];
    const factual_rating = document.querySelectorAll('.factual_rating_placeholder')[i];
    if (doc.title == "<p>Page not found - Media Bias/Fact Check</p>") {
      // append means add to it.
      $("#bias_rating_placeholder").appendChild(source_not_found);
      // erase everything in it.
      $("#factual_rating_placeholder").appendChild(source_not_found);
    } else if (bias_rating && factual_rating) {
      bias_rating.appendChild(biasImage);
      factual_rating.appendChild(ratingImage);
    }
  }
  $("#landing_header").hide();
  $("#sticky_header").show();
  $(".results").removeClass("hidden");
  add_user_input(user_input);
  spinner.stop();

}
function number_needed(num) {
  if (num <= 0) {
    alert("Please Enter A Number");
  }
}

// $(function () {
//   console.log("App loaded! Waiting for submit!");
//   // watchForm();
// });