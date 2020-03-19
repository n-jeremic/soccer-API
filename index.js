const getLeagues = async () => {
  try {
    const allCountries = await fetch("https://allsportsapi.com/api/football/?met=Countries&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd");
    const allCountriesJSON = await allCountries.json();

    const wantedCountries = ["Spain", "England", "Netherlands", "Portugal", "Germany", "Italy"];
    const wantedLeagues = ["LaLiga", "Premier League", "Eredivisie", "Primeira Liga", "Bundesliga", "Serie A"];
    const countryID = [];
    wantedCountries.forEach(country => {
      allCountriesJSON.result.forEach(el => {
        if (el.country_name === country) {
          countryID.push(el.country_key);
        }
      });
    });

    const leaguesPromise = countryID.map(el => getLeaguesByCountry(el));
    const allLeagues = await Promise.all(leaguesPromise);
    const myLeagues = [];

    wantedLeagues.forEach(league => {
      allLeagues.forEach(element => {
        element.result.forEach(el => {
          if (el.league_name === league) {
            myLeagues.push(el);
          }
        });
      });
    });

    return myLeagues;
  } catch (err) {
    console.log(err);
  }
};

const getLeaguesByCountry = async countryId => {
  const leagues = await fetch(`https://allsportsapi.com/api/football/?met=Leagues&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd&countryId=${countryId}`);
  const leaguesJSON = await leagues.json();

  return leaguesJSON;
};

const loadPanelLeagues = async () => {
  try {
    const myLeagues = await getLeagues();
    const from = "2020-01-17";
    const to = "2020-01-20";

    myLeagues.forEach(el => {
      $(`#${el.country_name}`).html(`<img src="${el.league_logo}" width="50px"><b>${el.league_name}</b> <span id="${el.country_name}-round" class="league-round"></span>`);
    });

    const fixturesPromises = myLeagues.map(el => getFixtures(el.league_key, from, to));
    const fixtures = await Promise.all(fixturesPromises);

    fixtures.forEach(el => {
      $(`#${el.result[0].country_name}-round`).html(el.result[0].league_round);
      createCollapsePanelGroup(el.result[0].league_key, el.result[0].country_name);
      el.result.forEach(event => {
        createCollapsePanel(
          event.event_home_team,
          event.event_away_team,
          event.home_team_logo,
          event.away_team_logo,
          el.league_key,
          event.event_key,
          event.country_name,
          event.event_date,
          event.event_time,
          event.event_stadium,
          event.event_referee,
          event.home_team_key,
          event.away_team_key
        );
        getOdds(event.event_key, event.event_home_team, event.event_away_team);
      });
    });
    $("#spinner").remove();
    $("#main_content").show(1000, "linear");
  } catch (err) {
    console.log(err);
  }
};

const getFixtures = async (leagueId, from, to) => {
  try {
    const fixtures = await fetch(`https://allsportsapi.com/api/football/?met=Fixtures&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd&from=2020-01-17&to=2020-01-20
        &leagueId=${leagueId}&timezone=Europe/Belgrade&from=${from}&to=${to}`);
    const fixturesJSON = await fixtures.json();

    return fixturesJSON;
  } catch (err) {
    console.log(err);
  }
};

const createCollapsePanel = (homeTeam, awayTeam, homeTeamImg, awayTeamImg, panelId, eventKey, countryName, eventDate, eventTime, eventStadium, eventReferee, homeTeamId, awayTeamId) => {
  const markUp = `<div class="panel panel-default">
  <div class="panel-heading text-center" role="tab">
    <h4 class="panel-title">
      <a
        role="button"
        data-toggle="collapse"
        data-parent="#${panelId}"
        href="#${eventKey}"
        aria-expanded="true"
        aria-controls="${eventKey}"
      >
       <img src="${homeTeamImg}" width="20px"> ${homeTeam} - ${awayTeam} <img src="${awayTeamImg}" width="30px"> 
      </a><b><span id="${eventKey}-playedGame" style='color: green; float: right; font-size: 25px'></span></b>
    </h4>
  </div>
  <div
    id="${eventKey}"
    class="panel-collapse collapse"
    role="tabpanel"
  >
    <div class="panel-body">
       <p class="text-center">${eventDate} at ${eventTime}</p>
       <p class="text-center">Stadium: ${eventStadium}</p>
       <p class="text-center">Referee: ${eventReferee}</p>         
             <table class="table-bordered table-odds">
                <thead>
                  <tr>
                     <th class="text-center">1</th>
                     <th class="text-center">X</th>
                     <th class="text-center">2</th>
                  </tr>
                </thead>
                <tbody id="${eventKey}-odds">
                </tbody>
             </table>
       <div class="row">
          <div class="col-lg-10 col-lg-offset-1">
              <button class="btn btn-success btn-xs btn-block btn-match" onclick='matchInfo(${homeTeamId}, ${awayTeamId}, "${homeTeamImg}", "${awayTeamImg}")'>Check out more info</button>           
          </div>
       </div> 
    </div>
  </div>
  </div>`;

  $(`.${countryName}-yes`).append(markUp);
};

const createCollapsePanelGroup = (panelId, countryName) => {
  const markUp = `<div class="panel-group ${countryName}-yes" id="${panelId}" role="tablist" aria-multiselectable="true">
   </div>`;

  $(`.${countryName}`).append(markUp);
};

const getOdds = async (eventId, homeTeamName, awayTeamName) => {
  const odds = await fetch(`https://allsportsapi.com/api/football/?met=Odds&matchId=${eventId}&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd`);
  const oddsJSON = await odds.json();

  const oddsObj = oddsJSON.result[eventId][0];
  const wantedOdds = {};

  $.each(oddsObj, function(key, value) {
    if (key === "odd_1") {
      wantedOdds[key] = value;
    } else if (key === "odd_2") {
      wantedOdds[key] = value;
    } else if (key === "odd_x") {
      wantedOdds[key] = value;
    }
  });

  const htmlTable = `<tr id="${eventId}-tr"><td><button id="${eventId}_1" class="btn btn-warning btn-block" onclick="placeBet(${eventId}, '${homeTeamName}', '${awayTeamName}', ${wantedOdds.odd_1}, 1)">${wantedOdds.odd_1}</button></td>
  <td><button id="${eventId}_0" class="btn btn-warning btn-block" onclick="placeBet(${eventId}, '${homeTeamName}', '${awayTeamName}', ${wantedOdds.odd_x}, 0)">${wantedOdds.odd_x}</button></td>
  <td><button id="${eventId}_2" class="btn btn-warning btn-block" onclick="placeBet(${eventId}, '${homeTeamName}', '${awayTeamName}', ${wantedOdds.odd_2}, 2)">${wantedOdds.odd_2}</button></td></tr>`;

  $(`#${eventId}-odds`).append(htmlTable);
  loadTicket();
};

const matchInfo = async (homeTeamId, awayTeamId, homeTeamImg, awayTeamImg) => {
  const h2hCall = await fetch(`https://allsportsapi.com/api/football/?met=H2H&APIkey=496132391282f6b4a9a3ddb0db64af4687cfde7d4eff343fe2e71289836fc2fd&firstTeamId=${homeTeamId}&secondTeamId=${awayTeamId}
  `);
  const h2h = await h2hCall.json();

  // HTML mark up
  $("#homeTeamLogo").attr("src", homeTeamImg);
  $("#awayTeamLogo").attr("src", awayTeamImg);
  $("#last5home").empty();
  $("#last5away").empty();
  $("#h2h").empty();
  $("#myModal").modal("show");

  h2h.result.H2H.forEach(el => {
    const tr = `<tr><td class="text-center">${el.event_home_team} <b>${el.event_final_result}</b> ${el.event_away_team} (${el.event_date})</td</tr>`;
    $("#h2h").append(tr);
  });

  h2h.result.firstTeamResults.forEach(el => {
    const tr = `<tr><td style="padding: 5px" class="text-center">${el.event_home_team} <b>${el.event_final_result}</b> ${el.event_away_team}</td></tr>`;
    $("#last5home").append(tr);
  });

  h2h.result.secondTeamResults.forEach(el => {
    const tr = `<tr><td style="padding: 5px" class="text-center">${el.event_home_team} <b>${el.event_final_result}</b> ${el.event_away_team}</td></tr>`;
    $("#last5away").append(tr);
  });
};

const placeBet = (eventId, homeTeamName, awayTeamName, odd, bet) => {
  let playedBet;
  var allBets;
  const myOdd = (Math.round(odd * 100) / 100).toFixed(2);

  switch (bet) {
    case 0:
      playedBet = "X";
      break;
    case 1:
      playedBet = 1;
      break;
    case 2:
      playedBet = 2;
      break;
  }
  const myBet = {
    homeTeamName,
    awayTeamName,
    myOdd,
    playedBet,
    eventId
  };

  const ticket = localStorage.getItem("ticket");
  if (ticket) {
    allBets = JSON.parse(ticket);
    for (let i = 0; i < allBets.length; i++) {
      if (allBets[i].eventId == eventId) {
        allBets.splice(i, 1);
      }
    }
    allBets.push(myBet);
    localStorage.setItem("ticket", JSON.stringify(allBets));
  } else {
    allBets = [];
    allBets.push(myBet);
    localStorage.setItem("ticket", JSON.stringify(allBets));
  }

  loadTicket();
  markButton(eventId, bet);
};

const loadTicket = () => {
  const ticket = localStorage.getItem("ticket");
  $("#myBets").empty();

  if (ticket && JSON.parse(ticket).length > 0) {
    const allBets = JSON.parse(ticket);
    let totalOdd = 1;

    $.each(allBets, (key, value) => {
      totalOdd *= parseFloat(value.myOdd);
      const li = `<li>${value.homeTeamName} - ${value.awayTeamName} <span style='float: right'><b>${value.playedBet} (${value.myOdd})</b> <button class='btn btn-xs btn-danger' onclick='deleteBet(${value.eventId}, "${value.playedBet}")'><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></span></li>`;
      $("#myBets").append(li);
      markButton(value.eventId, value.playedBet);
      $(`#${value.eventId}-playedGame`).html(`<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>`);
    });

    $("#numOfBets").html(`(${allBets.length})`);
    const finalOdd = (Math.round(totalOdd * 100) / 100).toFixed(2);
    $("#myBets").append(`<li role="separator" class="divider"></li><li><span style='float: right'><b>TOTAL ODD: ${finalOdd}</b></span></li>`);
  } else {
    const li = `<li class="text-center">You don't have any bets!</li>`;
    $("#myBets").append(li);
    $("#numOfBets").html(`(0)`);
  }
};

const deleteBet = (eventId, bet) => {
  let myBet;
  if (bet === "X") {
    myBet = 0;
  } else {
    myBet = parseInt(bet);
  }
  let ticket = localStorage.getItem("ticket");
  ticket = JSON.parse(ticket);
  const index = ticket.findIndex(el => el.eventId === eventId);
  ticket.splice(index, 1);
  localStorage.setItem("ticket", JSON.stringify(ticket));
  $(`#${eventId}-playedGame`).empty();
  $(`#${eventId}_${myBet}`).removeClass("blue-btn");
  loadTicket();
};

const markButton = (eventId, bet) => {
  let myBet;
  if (bet === "X") {
    myBet = 0;
  } else {
    myBet = parseInt(bet);
  }
  const buttonId = `${eventId}_${myBet}`;
  const buttons = $(`#${eventId}-tr button`);
  $.each(buttons, (key, value) => {
    if (value.id === buttonId) {
      value.classList.add("blue-btn");
    } else {
      value.classList.remove("blue-btn");
    }
  });
};
