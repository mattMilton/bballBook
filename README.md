# B-Ball Book

Version one of B-Ball book. 

## Version One Features

Web app can be run from any modern web browser. User will setup team info by entering in at least 5 players (minimum info is player's number) for both teams. Players can be added after initial setup. During game play, there is a game clock, which the user is responsible for keeping closely synced to actual game clock. When actual game events occur, user must enter the events into the app via game page buttons. 

App keeps running total of all players' stats. Plays (events) can be deleted, and app makes necessary changes to game stats. App keeps track of team fouls, and is therefore aware of free-throw shooting status for fouls that occur. Time-outs, jump-balls and other events also are tracked to determine other statuses. 

Clicking on a player shows that players detailed stats, and offers user the ability to substitute that player in or out of the game. 

## Version One Features not completed

Currently working on implementing local storage. Local storage necessary to protect against all service data being lost when user hits browser refresh button. There are a couple other potential reasons for needing it. One of which is navigation back to game page from some other event pages with a parameter. The parameter is a solution for stopping the clock under certain game event conditions. 

Styling is currently non-existent, but is the task that will be worked on soon. 

End game options. Send email report?, Save to local storage?. 

Start game page only has option to start new game, but need to include continue game (currently it actually only continues game, but that needs to be fixed.)

## Future Version Features

Remote database storage. 

Ability to load previously saved teams, instead of having to enter in data at start of every game. 