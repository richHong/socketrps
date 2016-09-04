$(document).ready(function(){

  //Connect to socket.io
  var socket = io();
  console.log(io)
  //Game object
  var game = {
    currentRound:1,
    gameWinGif:'',
    roomName:''
  };

  //Player 1 object
  var player1 = {
    currentChoice: '',
    score:0
  };

  //Player 2 object
  var player2 = {
    currentChoice:'',
    score: 0
  };

  //Function storing event listeners and waits for user responses
  var initGame = function(){

    $('#roomButton').click();

    $('#joinButton').on('click',function(){
      if($('#roomName').val() === ''){
        game.roomName = Math.floor(Math.random() * 1000);
      } else {
        game.roomName = $('#roomName').val();
      }
      $('#title').append(' * Room '+game.roomName);
      socket.emit('room', game.roomName);
    });

    //Initial search for winner gif
    $.getJSON('https://api.giphy.com/v1/gifs/search?q=win&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
      game.gameWinGif = url;
    });

    //Initial dog gif 
    $.getJSON('https://api.giphy.com/v1/gifs/search?q=dogs&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
       $('#p1Gif').html('<img class="gif" src='+url+'>');
    });

    //Initial cat gif
    $.getJSON('https://api.giphy.com/v1/gifs/search?q=cats&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
       $('#p2Gif').html('<img class="gif" src='+url+'>');
    });

    $('#sendMessage').submit(function(e){
      e.preventDefault();
      var username;
      if ($('#name').val() === ''){
        username = 'anonymous';
      } else{
        username = $('#replace').text();
      }
      var msgObj = {username:username, message:$('#m').val()};
      socket.emit('chat message', msgObj);
      $('#m').val('');
      return false;
    });

    socket.on('chat message', function(msgObj){
      $('#messages').append($('<li>').text(msgObj.username + ' : ' + msgObj.message));
      var objDiv = document.getElementById("messages");
      objDiv.scrollTop = objDiv.scrollHeight;
    });

     $('#name').submit(function(e){
      e.preventDefault();
      $('#replace').text($('#u').val());
      $('#u').val('');
    });

    $('.p1choice').on('click', function(e){
      e.preventDefault();
      socket.emit('p1 answer', $(this).val());
      $('#p1status').text('Choice selected!');
      // $('.p2choice').remove();
    });

    $('.p2choice').on('click', function(e){
      e.preventDefault();
      socket.emit('p2 answer', $(this).val());
      $('#p2status').text('Choice selected!');
      // $('.p1choice').remove();
    });

    $('#restartButton').on('click', function(){
      restartGame();
    })

    socket.on('p1 answer', function(choice){
      $('#p1status').text('Choice selected!');
      player1.currentChoice = choice;
      checkPlayChoice();
    });

    socket.on('p2 answer', function(choice){
      $('#p2status').text('Choice selected!');
      player2.currentChoice = choice;
      checkPlayChoice();
    });
  };

  //Checks if both players have selected
  var checkPlayChoice = function(){
    if (player1.currentChoice !== '' && player2.currentChoice !== ''){
      $("#hands").animate({top:'+=55'}, function(){
        $("#hands").animate({top:'-=110'}, function(){
          $("#hands").animate({top:'+=55'}, function(){  
            addScore(roundEnd());
            $('#p1status').text('Awaiting choice...');
            $('#p2status').text('Awaiting choice...');
          });
        });
      });
    }
  };

  //Randomly generates choice for single player game
  var genP2Choice = function(){
    var choices = ['ROCK', 'PAPER', 'SCISSORS'];
    return choices[Math.floor(Math.random() * 3)];
  };

  //Checks choices and determines winner of the round
  var roundEnd = function(){
    //Updates DOM with player choice gifs
    var p1c = player1.currentChoice;
    $('#p1Chose').text(p1c);
    $.getJSON('https://api.giphy.com/v1/gifs/search?q='+p1c.toLowerCase()+'&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
      $('#p1Gif').html('<img class="gif" src='+url+'>');
    });

    var p2c = player2.currentChoice;
    $('#p2Chose').text(p2c);
    $.getJSON('https://api.giphy.com/v1/gifs/search?q='+p2c.toLowerCase()+'&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
       $('#p2Gif').html('<img class="gif" src='+url+'>');
    });

    //Resets choices for round end
    player1.currentChoice = '';
    player2.currentChoice = '';

    //Conditional for player choices
    if (p1c === p2c){
      return 'draw';
    } else if (p1c === 'ROCK' && p2c === 'PAPER'){
      return 'player2';
    } else if (p1c === 'SCISSORS' && p2c === 'PAPER'){
      return 'player1';
    } else if (p1c === 'PAPER' && p2c === 'ROCK'){
      return 'player1';
    } else if (p1c === 'PAPER' && p2c === 'SCISSORS'){
      return 'player2';
    } else if (p1c === 'SCISSORS' && p2c === 'ROCK'){
      return 'player2';
    } else if (p1c === 'ROCK' && p2c === 'SCISSORS'){
      return 'player1';
    }
  };

  //Based on roundEnd result add to player score
  var addScore = function(result){
    if (result === 'player1'){
      player1.score++;
      $('#p1score').text(player1.score);
      $('#results').text('PLAYER 1 WINS THIS ROUND');
      checkWin();
    } else if (result === 'player2'){
      player2.score++;
      $('#p2score').text(player2.score);
      $('#results').text('PLAYER 2 WINS THIS ROUND');
      checkWin();
    } else if (result === 'draw'){
      $('#results').text('IT\'S A DRAW');
      checkWin();
    }
  };

  //Resets player choice and increments round number
  var nextRound = function(){
    game.currentRound++;
    $('#current-round').text(game.currentRound);
    player1.currentChoice = '';
    player2.currentChoice = '';
  };

  //Checks Win condition
  var checkWin = function(){
    if (player1.score === 2){
      return gameOver('player1');
    } else if (player2.score === 2){
      return gameOver('player2');
    } else {
      nextRound();
    }
  };

  //After winnner is found, declares winner on DOM and add restart button to page
  var gameOver = function(winner){
    if (winner === 'player1'){

      $('#modTitle').text('Player 1 wins!');
      $('#modBody').html('<img id="winGif" class="modal-content" src='+game.gameWinGif+'>');
      $('#winButton').click();
      $('body').append('<audio class="horn" autoplay="true"><source src="./Airhorn.mp3" "type="audio/mpeg"></audio>');
    } else if (winner === 'player2'){

      $('#modTitle').text('Player 2 wins!');
      $('#modBody').html('<img id="winGif" class="modal-content" src='+game.gameWinGif+'>');
      $('#winButton').click();
      $('body').append('<audio class="horn" autoplay="true"><source src="./Airhorn.mp3" "type="audio/mpeg"></audio>');
    }
  };

  //When clicked resets game data and starts new game
  var restartGame = function(){
    game.currentRound = 1;
    player1.currentChoice = '';
    player2.currentChoice = '';
    player1.score = 0;
    player2.score = 0;
    $('.horn').remove();
    $('#current-round').text(game.currentRound);
    $('#p1score').text(player1.score);
    $('#p2score').text(player1.score);
    $('#results').text('');
    $('#p1status').text('Awaiting choice...');
    $('#p2status').text('Awaiting choice...');
    $('#p1Chose').text('DOG');
    $('#p2Chose').text('CAT');
    $.getJSON('https://api.giphy.com/v1/gifs/search?q=dogs&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
       $('#p1Gif').html('<img class="gif" src='+url+'>');
    });
    $.getJSON('https://api.giphy.com/v1/gifs/search?q=cats&api_key=dc6zaTOxFJmzC', function(results){
      var random = Math.floor(Math.random() * 25);
      var url = results.data[random].images.original.url;
       $('#p2Gif').html('<img class="gif" src='+url+'>');
    });
  };

  //Initializes attachment of event handlers
  initGame();

});