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
    $("#league").empty();
    $("#league").attr("disabled", true);
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

const getTeams = async leagueId => {
  if (leagueId === "null_league") {
    $("#team").attr("disabled", true);
    $("#team").empty();
    return;
  }

  const teams = await fetch(`https://allsportsapi.com/api/football/?met=Teams&leagueId=${leagueId}&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd`);
  const teamsJSON = await teams.json();

  $("#team").empty();
  $("#team").attr("disabled", false);
  $("#team").append(`<option value="null">- - -</option>`);

  teamsJSON.result.forEach(el => {
    $("#team").append(`<option value="${el.team_key}">${el.team_name}</option>`);
  });
};

const getTeamInfo = async teamId => {
  if (teamId === "null") {
    return;
  }

  const info = await fetch(`https://allsportsapi.com/api/football/?met=Teams&teamId=${teamId}&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd`);
  const infoJSON = await info.json();

  $("#goalkeepers").empty();
  $("#defenders").empty();
  $("#midfielders").empty();
  $("#forwards").empty();

  infoJSON.result.forEach(element => {
    element.players.forEach(el => {
      const tableRow = `<tr><td>${el.player_number}</td><td>${el.player_name}</td><td>${el.player_country}</td><td>${el.player_age}</td><td>${el.player_match_played}</td><td>${el.player_goals}</td><td>${el.player_red_cards}</td><td>${el.player_yellow_cards}</td></tr>`;
      if (el.player_type === "Goalkeepers") {
        $("#goalkeepers").append(tableRow);
      } else if (el.player_type === "Defenders") {
        $("#defenders").append(tableRow);
      } else if (el.player_type === "Midfielders") {
        $("#midfielders").append(tableRow);
      } else {
        $("#forwards").append(tableRow);
      }
    });
  });
};
