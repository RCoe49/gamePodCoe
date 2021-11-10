// Set express as Node.js web application server framework.
var express = require('express'); 
var app = express(); 
var mysql = require('mysql');
const session = require('express-session')
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
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
// const con = mysql.createConnection({
//   host: "localhost",
//   user: "user",
// 	password: "thePhatestDataSquad",
// 	database: 'gamepod_schema'
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

var pgp = require('pg-promise')();
const con = {
	host: 'localhost',
	port: 5432,
	database: 'gamepod_schema',
	user: 'postgres',
	password: 'pwd'
};

var db = pgp(con);

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
	var str = 'SELECT * FROM players WHERE username = ?;'
	con.query(str, username, (err,rows) => {
		if(err) throw err;
		if(rows.length != 0) {
			errors.push("Username Unavailable");
		}
		if (errors.length == 0) {
			str = {username: username, password: password};
			con.query('INSERT INTO players SET ?', str, (err, data) => {
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
	res.render('pages/stats', {
		user:req.session.user
	});
});

// Games

app.get('/blackjack', function(req, res) {
	res.render('pages/blackjack', {
		user:req.session.user
	});
});

app.get('/helicopterGame', function(req, res) {
	//Variable that scores the user's score after they hit the submit button
	var helicopterScore = req.query.score;
	if(helicopterScore){
		//console.log(helicopterScore);
	}
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

// Terminate connection

// Listening

app.listen(3000);
console.log('Connected to port 3000. Visit "localhost:3000" on browser') 