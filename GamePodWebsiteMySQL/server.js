// Set express as Node.js web application server framework.
var usedb = false;
var express = require('express'); 
var app = express(); 
if (usedb)
  var mysql = require('mysql');
const session = require('express-session')
var bodyParser = require('body-parser'); // Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Set EJS as templating engine 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));
// The above line is necessary for us to use relative paths

// Set up sessions
app.use(session({ 
  
	// It holds the secret key for session 
	secret: 'andYetToEveryBadThereIsAWorse', 

	// Forces the session to be saved 
	// back to the session store 
	resave: true, 

	// Forces a session that is "uninitialized" 
	// to not be saved to the store 
	saveUninitialized: false
}));

// Set up MySql
if (usedb) {
  const con = mysql.createConnection({
    host: "localhost",
    user: "user",
    password: "thePhatestDataSquad",
    database: 'gamepod_schema',
    multipleStatements: true
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
}

////// get and post section //////

// General

// Home page
app.get('/', function(req, res) {
	res.render('pages/main', {
		user:req.session.user
	});
});

// Sign in page(s)
app.get('/account', function(req, res) {
	if (req.session.user) {
		// Redirect if already signed in
		res.redirect('/manage');
		return;
	};
	res.render('pages/account', {
		user:req.session.user,
		errors:"",
		username:"",
		password:""
	});
});

app.post('/account/submit', function(req, res) {
	var username = req.body.un;
	var password = req.body.pw;
	var errors = [];
	if (!username) {
		errors.push("Enter a Username");
	};
	if (!password) {
		errors.push("Enter a Password");
  };
  if (!usedb) {
    res.render('pages/account', {
			user:"",
			errors:errors,
			username:username,
			password:password
		});
  }
	if (errors.length == 0) {
		// Check if credentials are in the database
		var str = 'SELECT * FROM players WHERE username = ? AND password = ?;'
		con.query(str, [username, password], (err,rows) => {
			if(err) throw err;
			if(rows.length == 0) {
				errors.push("Invalid Credentials");
				res.render('pages/account', {
					user:"",
					errors:errors,
					username:username,
					password:password
				});
			}
			else {
				// Sign in successful
				req.session.user = username;
				res.redirect('/');
			}
		});
	}
	else {
		res.render('pages/account', {
			user:"",
			errors:errors,
			username:username,
			password:password
		});
	};
});

// Manage account page(s)
app.get('/manage', function(req, res) {
	res.render('pages/accountManage', {
		user:req.session.user,
		opw:"",
		npw:"",
		errors:""
	});
});

app.get('/manage/logout', function(req, res) {
	// Delete username from session to log out
	req.session.user = "";
	res.redirect('/');
});

app.post('/manage/submit', function(req, res) {
	var password = req.body.opw;
	var newPassword = req.body.npw;
	var errors = [];
	if (!password) {
		errors.push("Enter your Old Password");
	};
	if (!newPassword) {
		errors.push("Enter a New Password");
  };
  if (!usedb) {
    res.render('pages/accountManage', {
			user:req.session.user,
			errors:errors,
			opw:password,
			npw:newPassword
		});
  }
	if (errors.length == 0) {
		// Check if credentials are in the database
		var str = 'SELECT * FROM players WHERE username = ? and password = ?;'
		con.query(str, [req.session.user, password], (err,rows) => {
			if(err) throw err;
			if(rows.length == 0) {
				errors.push("Invalid Password");
				res.render('pages/accountManage', {
					user:req.session.user,
					errors:errors,
					opw:password,
					npw:newPassword
				});
			}
			else {
				// No errors, change the password
				str = 'UPDATE players SET password = ? WHERE username = ?;'
				con.query(str, [newPassword, req.session.user], (err,rows) => {
					errors.push("Password Successfully Updated");
					res.render('pages/accountManage', {
						user:req.session.user,
						errors:errors,
						opw:"",
						npw:""
					});
				})
			};
		});
	}
	else {
		res.render('pages/accountManage', {
			user:req.session.user,
			errors:errors,
			opw:password,
			npw:newPassword
		});
	};
});

// Sign up page(s)
app.get('/signup', function(req, res) {
	res.render('pages/accountCreate', {
		user:"",
		errors:"",
		username:"",
		password:""
	});
});

app.post('/signup/submit', function(req, res) {
	var username = req.body.un;
	var password = req.body.pw;
	var errors = [];
	if (!username) {
		errors.push("Enter a Username");
	};
	if (!password) {
		errors.push("Enter a Password");
  };
  if (!usedb) {
    res.render('pages/accountCreate', {
      user:"",
      errors:errors,
      username:username,
      password:password
    });
  }
	var str = 'SELECT * FROM players WHERE username = ?;'
	con.query(str, username, (err,rows) => {
		if(err) throw err;
		if(rows.length != 0) {
			errors.push("Username Unavailable");
		}
		if (errors.length == 0) {
			str = {username: username, password: password};
      con.query('INSERT INTO players SET ?;' + 
        'INSERT INTO playerRecords(playerId, gameId) SELECT p.playerId, g.gameId FROM players p, games g WHERE p.username = ?;',
        [str, username], (err, data) => {
				if(err) throw err;
				req.session.user = username;
				res.redirect('/');
			});
		}
		else {
			res.render('pages/accountCreate', {
				user:"",
				errors:errors,
				username:username,
				password:password
			});
		}
	});
});

// Statistics page
app.get('/stats', function(req, res) {
  if (!usedb) {
    res.render('pages/stats', {
      user:req.session.user,
      data:''
    });
  }
  var str = (
    'SELECT pr.* FROM playerRecords pr, players p  WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 1;' +
    'SELECT pr.* FROM playerRecords pr, players p  WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 2;' +
    'SELECT pr.* FROM playerRecords pr, players p  WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 3;' +
    'SELECT pr.* FROM playerRecords pr, players p  WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 4;' +
    'SELECT pr.* FROM playerRecords pr, players p  WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 5;' +
    'SELECT p.username un, pr.score0 score FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND pr.gameId = 1 ORDER BY pr.score0 DESC LIMIT 3;' +
    'SELECT p.username un, pr.score0 score FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND pr.gameId = 2 ORDER BY pr.score0 DESC LIMIT 3;' +
    'SELECT p.username un, pr.score0 score FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND pr.gameId = 3 ORDER BY pr.score0 DESC LIMIT 3;' + 
    'SELECT p.username un, pr.score0 score FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND pr.gameId = 4 ORDER BY pr.score0 DESC LIMIT 3;' + 
    'SELECT p.username un, pr.score0 score FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND pr.gameId = 5 ORDER BY pr.score0 DESC LIMIT 3;');
  con.query(str, [req.session.user, req.session.user, req.session.user, req.session.user, req.session.user], (err,rows) => {
    if(err) throw err;
    res.render('pages/stats', {
      user:req.session.user,
      data:rows
    });
  });
});

// Games

app.get('/blackjack', function(req, res) {
	res.render('pages/blackjack', {
		user:req.session.user
	});
});

app.get('/helicopterGame', function(req, res) {
	res.render('pages/helicopterGame', {
		user:req.session.user
	});
});

app.get('/pong', function(req, res) {
	res.render('pages/pong', {
		user:req.session.user
	});
});

app.get('/snakeGame', function(req, res) {
	res.render('pages/snakeGame', {
		user:req.session.user
	});
});

app.get('/walkingSim', function(req, res) {
	res.render('pages/walkingSimulator', {
		user:req.session.user
	});
});

// Games post section
app.post('/helicopterGame', function(req, res) {
  if (!usedb) {
    res.redirect('/helicopterGame');
  }
  var score = Number(req.body.score);
	var str = 'SELECT pr.* FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 2;'
	con.query(str, req.session.user, (err,rows) => {
    if(err) throw err;
    var scorePlace = -1;
    if (score > rows[0].score0) {
      scorePlace = 0;
    }
    else if (score > rows[0].score1) {
      scorePlace = 1;
    }
    else if (score > rows[0].score2) {
      scorePlace = 2;
    }
    else if (score > rows[0].score3) {
      scorePlace = 3;
    }
    else if (score > rows[0].score4) {
      scorePlace = 4;
    }
    else if (score > rows[0].score5) {
      scorePlace = 5;
    }
    else if (score > rows[0].score6) {
      scorePlace = 6;
    }
    else if (score > rows[0].score7) {
      scorePlace = 7;
    }
    else if (score > rows[0].score8) {
      scorePlace = 8;
    }
    else if (score > rows[0].score9) {
      scorePlace = 9;
    }
    if (scorePlace != -1) {
      //  Move all lower value down one
      for (var i = 9; i > scorePlace; i--) {
        str = (
          'UPDATE playerRecords SET score' + i.toString() + ' = score' + (i-1).toString() + 
          ' WHERE gameId = 2 AND playerId IN (SELECT playerId FROM players WHERE username = ?);');
        con.query(str, [req.session.user, req.session.user], (err,rows) => {
          if(err) throw err;
        });
      }
      //  Set new value
      str = 'UPDATE playerRecords SET ' + 'score' + scorePlace.toString() + ' = ? WHERE gameId = 2 AND playerId IN (SELECT playerId FROM players WHERE username = ?);'
	    con.query(str, [score, req.session.user], (err,rows) => {
        if(err) throw err;
      });
    }
    res.redirect('/helicopterGame');
  });
});

app.post('/walkingSim', function(req, res) {
  if (!usedb) {
    res.redirect('/walkingSim');
  }
  var score = Number(req.body.score);
	var str = 'SELECT pr.* FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 3;'
	con.query(str, req.session.user, (err,rows) => {
    if(err) throw err;
    var scorePlace = -1;
    if (score > rows[0].score0) {
      scorePlace = 0;
    }
    else if (score > rows[0].score1) {
      scorePlace = 1;
    }
    else if (score > rows[0].score2) {
      scorePlace = 2;
    }
    else if (score > rows[0].score3) {
      scorePlace = 3;
    }
    else if (score > rows[0].score4) {
      scorePlace = 4;
    }
    else if (score > rows[0].score5) {
      scorePlace = 5;
    }
    else if (score > rows[0].score6) {
      scorePlace = 6;
    }
    else if (score > rows[0].score7) {
      scorePlace = 7;
    }
    else if (score > rows[0].score8) {
      scorePlace = 8;
    }
    else if (score > rows[0].score9) {
      scorePlace = 9;
    }
    if (scorePlace != -1) {
      //  Move all lower value down one
      for (var i = 9; i > scorePlace; i--) {
        str = (
          'UPDATE playerRecords SET score' + i.toString() + ' = score' + (i-1).toString() + 
          ' WHERE gameId = 3 AND playerId IN (SELECT playerId FROM players WHERE username = ?);');
        con.query(str, [req.session.user, req.session.user], (err,rows) => {
          if(err) throw err;
        });
      }
      //  Set new value
      str = 'UPDATE playerRecords SET ' + 'score' + scorePlace.toString() + ' = ? WHERE gameId = 3 AND playerId IN (SELECT playerId FROM players WHERE username = ?);'
	    con.query(str, [score, req.session.user], (err,rows) => {
        if(err) throw err;
      });
    }
    res.redirect('/walkingSim');
  });
});

app.post('/blackjack', function(req, res) {
  if (!usedb) {
    res.redirect('/blackjack');
  }
  var score = Number(req.body.score);
	var str = 'SELECT pr.* FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 4;'
	con.query(str, req.session.user, (err,rows) => {
    if(err) throw err;
    var scorePlace = -1;
    if (score > rows[0].score0) {
      scorePlace = 0;
    }
    else if (score > rows[0].score1) {
      scorePlace = 1;
    }
    else if (score > rows[0].score2) {
      scorePlace = 2;
    }
    else if (score > rows[0].score3) {
      scorePlace = 3;
    }
    else if (score > rows[0].score4) {
      scorePlace = 4;
    }
    else if (score > rows[0].score5) {
      scorePlace = 5;
    }
    else if (score > rows[0].score6) {
      scorePlace = 6;
    }
    else if (score > rows[0].score7) {
      scorePlace = 7;
    }
    else if (score > rows[0].score8) {
      scorePlace = 8;
    }
    else if (score > rows[0].score9) {
      scorePlace = 9;
    }
    if (scorePlace != -1) {
      //  Move all lower value down one
      for (var i = 9; i > scorePlace; i--) {
        str = (
          'UPDATE playerRecords SET score' + i.toString() + ' = score' + (i-1).toString() + 
          ' WHERE gameId = 4 AND playerId IN (SELECT playerId FROM players WHERE username = ?);');
        con.query(str, [req.session.user, req.session.user], (err,rows) => {
          if(err) throw err;
        });
      }
      //  Set new value
      str = 'UPDATE playerRecords SET ' + 'score' + scorePlace.toString() + ' = ? WHERE gameId = 4 AND playerId IN (SELECT playerId FROM players WHERE username = ?);'
	    con.query(str, [score, req.session.user], (err,rows) => {
        if(err) throw err;
      });
    }
    res.redirect('/blackjack');
  });
});

app.post('/snakeGame', function(req, res) {
  if (!usedb) {
    res.redirect('/snakeGame');
  }
  var score = Number(req.body.score);
	var str = 'SELECT pr.* FROM playerRecords pr, players p WHERE pr.playerId = p.playerId AND p.username = ? AND pr.gameId = 1;'
	con.query(str, req.session.user, (err,rows) => {
    if(err) throw err;
    var scorePlace = -1;
    if (score > rows[0].score0) {
      scorePlace = 0;
    }
    else if (score > rows[0].score1) {
      scorePlace = 1;
    }
    else if (score > rows[0].score2) {
      scorePlace = 2;
    }
    else if (score > rows[0].score3) {
      scorePlace = 3;
    }
    else if (score > rows[0].score4) {
      scorePlace = 4;
    }
    else if (score > rows[0].score5) {
      scorePlace = 5;
    }
    else if (score > rows[0].score6) {
      scorePlace = 6;
    }
    else if (score > rows[0].score7) {
      scorePlace = 7;
    }
    else if (score > rows[0].score8) {
      scorePlace = 8;
    }
    else if (score > rows[0].score9) {
      scorePlace = 9;
    }
    if (scorePlace != -1) {
      //  Move all lower value down one
      for (var i = 9; i > scorePlace; i--) {
        str = (
          'UPDATE playerRecords SET score' + i.toString() + ' = score' + (i-1).toString() + 
          ' WHERE gameId = 1 AND playerId IN (SELECT playerId FROM players WHERE username = ?);');
        con.query(str, [req.session.user, req.session.user], (err,rows) => {
          if(err) throw err;
        });
      }
      //  Set new value
      str = 'UPDATE playerRecords SET ' + 'score' + scorePlace.toString() + ' = ? WHERE gameId = 1 AND playerId IN (SELECT playerId FROM players WHERE username = ?);'
	    con.query(str, [score, req.session.user], (err,rows) => {
        if(err) throw err;
      });
    }
    res.redirect('/snakeGame');
  });
});

// Terminate connection

// Listening

app.listen(3001);
console.log('listining to port 3001') 