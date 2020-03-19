const getCountries = async () => {
  const countries = await fetch(`https://allsportsapi.com/api/football/?met=Countries&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd`);
  const countriesJSON = await countries.json();

  const wantedCountries = ["England", "Spain", "Germany", "Netherlands", "Portugal", "Italy"];
  const myCountries = [];

  countriesJSON.result.forEach(el => {
    if (wantedCountries.includes(el.country_name)) {
      myCountries.push(el);
    }
  });

  myCountries.forEach(el => {
    $("#country").append(`<option value="${el.country_key}">${el.country_name}</option>`);
  });

  $("#league").attr("disabled", "true");

  return myCountries;
};

const getLeagues = async countryId => {
  if (countryId == "null") {
    $("#league").attr("disabled", true);
    $("#league").empty();
    $("#league").append(`<option value="null_league">- - -</option>`);
    $("#standings").hide(300, "linear");
    return;
  }

  const leagues = await fetch(`https://allsportsapi.com/api/football/?met=Leagues&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd&countryId=${countryId}`);
  const leaguesJSON = await leagues.json();

  const wantedLeagues = ["Premier League", "Championship", "Bundesliga", "2. Bundesliga", "Serie A", "Serie B", "Eredivisie", "Eerste Divisie", "Primeira Liga", "LigaPro", "LaLiga", "LaLiga2"];

  const myLeagues = [];
  leaguesJSON.result.forEach(el => {
    if (wantedLeagues.includes(el.league_name)) {
      myLeagues.push(el);
    }
  });

  $("#league").empty();
  $("#league").append(`<option value="null_league">- - -</option>`);
  myLeagues.forEach(el => {
    $("#league").append(`<option value="${el.league_key}">${el.league_name}</option>`);
  });
  $("#league").attr("disabled", false);
};

const getStandings = async leagueId => {
  $("#standings").hide(300, "linear");
  if (leagueId == "null_league") {
    return;
  }

  const standings = await fetch(`https://allsportsapi.com/api/football/?met=Standings&leagueId=${leagueId}&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd
   `);
  const standingsJSON = await standings.json();

  $("#league_tbody").empty();
  standingsJSON.result.total.forEach(el => {
    $("#league_tbody").append(
      `<tr><td class="text-center">${el.standing_place}</td><td class="text-center">${el.standing_team}</td><td class="text-center">${el.standing_P}</td><td class="success text-center">${el.standing_W}</td><td class="warning text-center">${el.standing_D}</td><td class="danger text-center">${el.standing_L}</td><td class="text-center">${el.standing_F}</td><td class="text-center">${el.standing_A}</td><td class="info text-center"><b>${el.standing_PTS}</b></td></tr>`
    );
  });
  $("#standings").show(1500, "linear");
};
