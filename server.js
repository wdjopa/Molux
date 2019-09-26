var port = process.env.PORT || 5000;
var request = require('request');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var vm = require('vm');
var assert = require('assert');

// var bodyParser = require('body-parser'); 
// var urlencodedParser = bodyParser.urlencoded({ extended: false });
var db;
// var verif_username = require('vm');
var cookies;


var utilisateursConnectes = {};
var groupes = {};
var parties = {};
var games = {};
var tels = {};
var users = {};
var messages = {};
var contacts = {};
var messageries = {};
//var cors = require('cors');

// use it before all route definitions
//app.use(cors({origin: 'http://localhost:8888'}));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

	res.setHeader('Access-Control-Allow-Origin', 'http://moduleweb.esigelec.fr');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/=:admin', function(req, res){
	if(parties[req.params.admin] != null){
		res.sendFile(__dirname + '/parties.html');
        //console.log(parties);
    }else{
		res.sendFile(__dirname + '/index.html');
	}
});
app.get('/accueil.html', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.get('/index.html', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.get('/index', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.get('/parties', function(req, res){
	res.sendFile(__dirname + '/parties.html');
});
app.get('/parties.html', function(req, res){
	res.sendFile(__dirname + '/parties.html');
});
app.get('/erreur', function(req, res){
	res.sendFile(__dirname + '/erreur.html');
});
app.get('/joueurs.html', function(req, res){
	res.sendFile(__dirname + '/joueurs.html');
});
app.get('/joueurs', function(req, res){
	res.sendFile(__dirname + '/joueurs.html');
});
app.get('/compte.html', function(req, res){
	res.sendFile(__dirname + '/compte.html');
});
app.get('/compte', function(req, res){
	res.sendFile(__dirname + '/compte.html');
});

app.get('/listejoueurs', function(req, res){
	res.send(JSON.stringify(utilisateursConnectes));
});

var mongoPassword = 'willaudyv2016';

var dbase="dcafc3fe9a3456a911b404aae165817b";
var config = JSON.parse('{"mongo": {"hostString": "6a.mongo.evennode.com:27017/dcafc3fe9a3456a911b404aae165817b","user": "dcafc3fe9a3456a911b404aae165817b","db": "dcafc3fe9a3456a911b404aae165817b"}}');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://" + config.mongo.user + ":" + encodeURIComponent(mongoPassword) + "@" + config.mongo.hostString+"?replicaSet=eu-6";
MongoClient.connect(
	url,{ useNewUrlParser: true },
	function(err, dbs) {
		console.log(err);
		if(!err) {
			db = dbs.db(dbase);

			db.createCollection("user", function(err, res) {
				if (err) console.log(err);
			});
			db.createCollection("game", function(err, res) {
				if (err) console.log(err);
			});
			db.createCollection("contact", function(err, res) {
				if (err) console.log(err);
			});

			// db.dropCollection("user")
			// db.dropCollection("contact")
			// db.dropCollection("game")

			db.collection("user").createIndex( { "user.pseudo": 1},{ collation: { locale: 'en', strength: 2 } } )

			
			db.collection("user").find({}).toArray(function(err, result) {
				if (err) console.log(err);
				//console.log(result);
				
				for(r in result){
					
					users[result[r].user.pseudo] = result[r].user;
				}
				
				if(result.length == 0)
				users = {};
				// console.log(result);
			});

			//db.collection("user").remove({elt: "Cameroun"})
			
			db.collection("contact").find({}).toArray(function(err, result) {
				if (err) console.log(err);
				// console.log(result);
				
				if(result.length == 0)
				contacts = {};
			});
			db.collection("game").find({}).toArray(function(err, result) {
				if (err) console.log(err);
				// console.log(result);
				if(result.length == 0)
				games = {};
			});
			console.log("We are connected to MongoDB");
		} else {
			console.log("Error while connecting to MongoDB");
		}
	}
);

app.get('/listUsers', function(req, res){
	MongoClient.connect(url,{ useNewUrlParser: true },function(err, dbs) {
		db = dbs.db(dbase);
		db.collection("user").find({}).toArray(function(err, result) {
			if (err) console.log(err);
			for(r in result){
				users[result[r].user.pseudo] = result[r].user;
			}
			res.send(JSON.stringify(users));
		});
	});
});

app.get('/listContacts', function(req, res){
	MongoClient.connect(url,{ useNewUrlParser: true },function(err, dbs) {
		db = dbs.db(dbase);
		db.collection("contact").find({}).toArray(function(err, result) {
			if (err) console.log(err);
			for(r in result){
				contacts[result[r].user.pseudo] = result[r].contact;
			}
			res.send(JSON.stringify(contacts));
		});
	});
});

// Chargement de socket.io
var io = require('socket.io').listen(http);
io.sockets.on("connection", function (socket){
	
	var user = {};
	var partie = {};

	socket.on("bug", function (){
		console.log("********************** "+user.pseudo+" a signalé un bug. **********************");
	})

	socket.on('login',function(name){

		if(!in_array_attribut(name, utilisateursConnectes, 'name')){
			user.pseudo = name;
			utilisateursConnectes[name] = user;
			io.sockets.emit("utilisateur connecte", utilisateursConnectes);
			io.sockets.emit("groupes", groupes);
			console.log("Connexion de "+user.pseudo);
			console.log(utilisateursConnectes);
		}
		else{
			socket.emit("existe deja", name);
		}
	});

	socket.emit("liste users", utilisateursConnectes);
	
	socket.on('disconnect', function(){
		if(user != {} && user != null){
			delete utilisateursConnectes[user.pseudo];
			console.log("Deconnexion d'un utilisateur.\nCaractéristiques: ");
			console.log(user);
			io.sockets.emit("il quitte la partie", partie.admin, user.pseudo);
			user.derniereConnexion=new Date();
			console.log("@@@ Mise a jour des données");
			MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
				if (err) console.log(err);
				var dbo = db.db(dbase);
				dbo.collection("user").update({"user.pseudo":user.pseudo},{"user":user});
			});
			if(parties[user.pseudo]){
				// Il est admin d'une partie
				console.log("AVANT");
				console.log(parties[user.pseudo]);
				if(parties[user.pseudo].etat == 1 && parties[user.pseudo].joueurs.length > 1){
					// La partie est en cours, on change d'admin
					console.log(" ---- changement d'admin -----");
					let part = parties[user.pseudo];
					
					part.admin = parties[user.pseudo].listeJoueurs[1];
					delete part.listeJoueurs[0];
					delete part.joueurs[0];
					delete part.listeScores[0];
					part.listeJoueurs.splice(0,1);
					part.joueurs.splice(0,1);
					part.listeScores.splice(0,1);
					
					let ind = part.joueursPrets.indexOf(user.pseudo);
					if(ind >= 0){
						delete part.joueursPrets[ind];
						part.joueursPrets.splice(ind,1);
						part.prets--;
					}
					
					if(part.prets<0)
						part.prets = 0;
					part.niveau = niveauMoyen(part.joueurs);
					
					console.log("APRES");
					console.log(part);
					
					parties[part.admin] = part;
					delete parties[user.pseudo];
					console.log("<<<<<<<<< PARTIES APRES >>>>>>>>>>");
					console.log(parties);
					io.sockets.emit("replace partie", user.pseudo, part);
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));

					if(parties[part.admin].etat != 1){
						if(parties[part.admin].prets >= parties[part.admin].joueurs.length || parties[part.admin].listeJoueurs.length == parties[part.admin].joueursPrets.length){
							io.sockets.emit("lancement de la partie",part);
						}
					}
				}
				else{
					delete parties[user.pseudo];
					partie = {};
					console.log("===========     PARTIES  ----------    ===============");
					console.log(parties);
					io.sockets.emit("suppression partie", user.pseudo);	
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));
				}
			}
			else if(parties[partie.admin]){
				// Il appartient a une partie
				if(partie.etat != 2){
					// La partie n'est pas encore terminée
					// On supprime tout ce qui lui appartient
					console.log(user.pseudo," a quitté la partie créée par ", partie.admin);
					console.log("------- LA PARTIE EN QUESTION  -------");
					console.log(partie);
					console.log(" ---- DIMENSION AVANT ---");
					console.log(partie.joueurs.length);
					//Un joueur quitte une partie
					let indice = partie.listeJoueurs.indexOf(user.pseudo);
					delete partie.listeJoueurs[indice];
					delete partie.listeScores[indice];
					delete partie.joueurs[indice];
					// Splice(indice, n) : Supprime n élts à partir de indice
					partie.listeJoueurs.splice(indice,1);
					partie.joueurs.splice(indice,1);
					partie.listeScores.splice(indice,1);
					
					let ind = partie.joueursPrets.indexOf(user.pseudo);
					if(ind >= 0){
						delete partie.joueursPrets[ind];
						partie.joueursPrets.splice(ind,1);
						partie.prets--;
					}
					
					if(partie.prets<0)
						partie.prets = 0;
					partie.niveau = niveauMoyen(partie.joueurs);
					parties[partie.admin] = partie;
					if(partie.etat != 1){
						io.sockets.emit("partie rejoint", parties[partie.admin]);
					}
					if(parties[partie.admin].etat != 1){					
						if(parties[partie.admin].prets >= parties[partie.admin].joueurs.length || parties[partie.admin].listeJoueurs.length == parties[partie.admin].joueursPrets.length){
							io.sockets.emit("lancement de la partie",parties[partie.admin]);
						}
					}
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));
					
					console.log(" ---- DIMENSION APRES ---");
					console.log(partie.joueurs.length);
					console.log(" ---- PARTIES ---");
					console.log(parties);
					console.log(" ---- PARTIES EN QUESTION 2 ---");
					console.log(parties[partie.admin]);
					
				}
				else{
					// La partie est terminée
					console.log(user.pseudo," a quitté la partie terminée qui a été créée par ", partie.admin);
				}
			}		
			
			console.log("Deconnexion de "+user.pseudo);
			io.sockets.emit("utilisateur connecte", utilisateursConnectes);
		}
	});
	
	socket.on("message", function (message){
		console.log(message);
	})

	socket.on("replace partie", function (name, part){
		if(partie.admin == name){
			partie = part;
		}
	})

	socket.on("update data", function (elt, val){
		if(elt == "pseudo"){
			console.log(val);

			MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
				if (err) console.log(err);
				var dbo = db.db(dbase);
				dbo.collection("user").find({"user.pseudo":val}).collation( { locale: 'en', strength: 1 } ).toArray(function (err, r){
					let a = r.length;
					if(a>1){
						//Deja existant
						socket.emit("update error", elt);
					}
					else{
						user[elt] = val;
						console.log(user.pseudo+" a changé des données. "+elt+" quitte de "+user[elt]+" à "+val);
						elt = "user."+elt;
						users[user.pseudo] = user;
						user = user;
						db.close();
						MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
							if (err) console.log(err);
							var dbo = db.db(dbase);
							dbo.collection("user").update({"user.pseudo":user.pseudo},{"user":user});
						});
						socket.emit("update finish", user);
						
					}
				});
			});
		}
		else{

			user[elt] = val;
			console.log(user.pseudo+" a changé des données. "+elt+" quitte de "+user[elt]+" à "+val);
			elt = "user."+elt;
			users[user.pseudo] = user;
			user = user;
			
			MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
				if (err) console.log(err);
				var dbo = db.db(dbase);
				dbo.collection("user").update({"user.pseudo":user.pseudo},{"user":user});
			});
			socket.emit("update finish", user);
		}
	})

	socket.on("search", function(search){
		let names = [];
		for(name in users){
			let n = name.toLowerCase();
			if(n.includes(search.toLowerCase())){
				names.push(name);
			}
		}
		console.log(names);
		socket.emit("results search", names);
	})

	function genererLettresDoublons (){
		let alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let voyelle = 'aeiuo'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let consonne = 'bbccddffgghhjjkllmmnnppqrrssttvvwxzy'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let chaine = "";
		do{
			chaine+=consonne[nombre_aleatoire(0,consonne.length)].toUpperCase();
		}while(chaine.length<4);
		do{
			chaine+=voyelle[nombre_aleatoire(0,voyelle.length)].toUpperCase();
		}while(chaine.length<8);
		chaine = chaine.split('').sort(function(){return 0.5-Math.random()}).join('');
		return chaine.split("");
	}
	
	function genererLettres (){
		let alphabet = 'abcdefghijklmnopqrstuvwxyz';
		let voyelle = 'aeiuo'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let consonne = 'bbccddffgghhjjkllmmnnppqrrssttvvwxzy'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let chaine = "";
		do{
			let m;
			do{
				m = consonne[nombre_aleatoire(0,consonne.length)].toUpperCase();
			}while(chaine.indexOf(m)>=0);
			chaine+=m;
		}while(chaine.length<4);
		do{
			let m;
			do{
				m = voyelle[nombre_aleatoire(0,voyelle.length)].toUpperCase();
			}while(chaine.indexOf(m)>=0);
			chaine+=m;
		}while(chaine.length<8);
		chaine = chaine.split('').sort(function(){return 0.5-Math.random()}).join('');
		return chaine.split("");
	}

	socket.on("lancer partie", function (partiep) {
		//La partie a été lancée par l'admin
		if(partie){
			if(partie.parametres && partie.parametres.pluralite){
				partie = partiep
				partie.etat = 1;
				partie.joueursPrets = [];
				parties[partie.admin] = partie;
				io.sockets.emit("partie lancee", partie);
				io.sockets.emit("parties", parties);
				let parts = [];
				for(var a in parties){
					parts.push(parties[a]);
				}
				io.sockets.emit("server-android:parties", JSON.stringify(parts));
				//Génération des lettres
				if(partie.parametres.pluralite == "oui"){
					// Lettres sans doublons
					partie.lettres = genererLettres();
				}
				else{
					// Lettres avec doublons
					partie.lettres = genererLettresDoublons();
				}
				io.sockets.emit("partie prete", partie);
				console.log("========== PARTIE LANCEE ============");
				console.log(partie);
			}
		}
	})

	socket.on("ready", function (){
		if(parties[partie.admin]){

			console.log(user.pseudo+" est pret.");
			/***
			 * 
			 */
			io.sockets.emit("est pret", user.pseudo, parties[partie.admin].listeJoueurs);
			parties[partie.admin].prets++;
			parties[partie.admin].joueursPrets.push(user.pseudo);
			// parties[partie.admin].debut = partie.parametres.temps;
			partie = parties[partie.admin]
			io.sockets.emit("partie en cours", partie);
			console.log(partie.prets);
			if(partie.prets >= partie.joueurs.length || parties[partie.admin].joueursPrets.length == parties[partie.admin].listeJoueurs.length){
				//Tout le monde est pret
				io.sockets.emit("lancement de la partie",partie);
			}
		}
		else{
			socket.emit("deconnexion");
		}
	})

	socket.on("occupe", function(){
		user.etat = 2;
		utilisateursConnectes[name] = user;
		io.sockets.emit("utilisateur connecte", utilisateursConnectes);
	})

	socket.on("appel", function(nom, message){
		io.sockets.emit("recevoir appel", nom, user.pseudo, message);
		console.log(user.pseudo, "a appelé", nom);
	})

	socket.on("end game", function (game){
		if(partie != {} && parties[game.admin]){
			console.log(" =============== FIN DE JEU APPELE PAR ", user.pseudo, " ===============");
			let chaine;
			console.log(game);
			//Enregistrer les games
			MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
				if (err) console.log(err);
				var dbo = db.db(dbase);
				dbo.collection("game").insertOne({game})
				games[game.admin] = game;		
				
				//Retourner la partie et les resultats
				let scores = [];
				//partie = parties[game.admin];
				partie.etat = 2;
				let indice = partie.listeJoueurs.indexOf(game.username);
				partie.listeScores[indice] = game.score;
				game.listeMots.forEach(function (mot){
					if(partie.motsTrouves.indexOf(mot) < 0){	
						partie.motsTrouves.push(mot);
					}
				});
				let ind = partie.listeJoueurs.indexOf(game.username);
				if(ind >= 0){
					// delete partie.joueursPrets[ind];
					// partie.joueursPrets.splice(ind,1);
					partie.prets--;
				}

				/*
				if(parties[partie.admin].prets<0)
					parties[partie.admin].prets = 0;
				console.log(partie);
				*/
				parties[game.admin] = partie;
				
				if(parties[game.admin].prets <= 0 || partie.joueursPrets.length<=0){
					indice = 0;
					parties[game.admin].listeScores.forEach(function (score){
						scores.push({user:parties[game.admin].listeJoueurs[indice], score:score});
						indice++;
					})
					partie.classement = classement(scores);
					io.sockets.emit("end game", partie);
					partie = {};
					user.etat = 0;
					utilisateursConnectes[user.pseudo] = user;
					io.sockets.emit("utilisateur connecte", utilisateursConnectes);
					delete parties[game.admin];
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));
				}
			});
		}
	})

	function classement(scores){
		scores.sort(function (b, a){
			return a.score - b.score;
		});
		console.log("scores rangés");
		console.log(scores);
		return scores;
	}

	socket.on("non-lus", function (nombreMessages, username){
		io.sockets.emit("non-lus", nombreMessages, username);
	})

	socket.on("messenger:cmd", function (message){
		console.log("Messenger a dit : "+message);
		socket.emit("messenger:cmd", message);
	})

	socket.on("creer partie", function (partie1){
		if(user.pseudo == null){
			console.log("deconnexion");
			socket.emit("deconnexion");
		}
		else{
			if(!parties[user.pseudo]){
				parties[user.pseudo] = partie1;
				parties[user.pseudo].admin = user.pseudo;
				parties[user.pseudo].listeJoueurs = [];
				parties[user.pseudo].joueurs = [];
				parties[user.pseudo].listeScores = [];
				parties[user.pseudo].motsTrouves = [];
				parties[user.pseudo].lettre = [];
				parties[user.pseudo].messages = [];
				parties[user.pseudo].joueursPrets = [];
				//etat = 0 signifie la partie est encore disponible
				parties[user.pseudo].etat = 0;
				parties[user.pseudo].prets = 0;
				parties[user.pseudo].listeJoueurs.push(user.pseudo);
				parties[user.pseudo].joueurs.push(user);
				parties[user.pseudo].listeScores.push(0);
				parties[user.pseudo].niveau = niveauMoyen(parties[user.pseudo].joueurs);
				// console.log(parties);
				partie = parties[user.pseudo]; //
				user.etat = 2; 
				//Le joueur est dans un groupe
				// socket.emit("partie creee");
				console.log(user.pseudo+" a créé une nouvelle partie.");
				io.sockets.emit("parties", parties);
				let parts = [];
				for(var a in parties){
					parts.push(parties[a]);
				}
				io.sockets.emit("server-android:parties", JSON.stringify(parts));
			}
			else{
				socket.emit("partie existe deja");
			}
		}
	})

	socket.on("retirer", function(nom){
		console.log(partie.admin+" a retiré "+nom+" de sa partie.");
		io.sockets.emit("retirer", nom);
	})

	socket.on("message des parties", function (message, admin){
		if(admin && parties[admin]){

			console.log(message.sender, "a envoyé le message <",message.texte,"> dans la partie de ",admin)
			//partie.messages.push(message);
			parties[admin].messages.push(message);
			io.sockets.emit("parties", parties);
			let parts = [];
			for(var a in parties){
				parts.push(parties[a]);
			}
			io.sockets.emit("server-android:parties", JSON.stringify(parts));
			io.sockets.emit("message des parties", admin);
		}
	});

	socket.on("open chat", function (admin){
		if(partie.admin == admin){			
			io.sockets.emit("message des parties", admin);
		}
	});
	
	socket.on("message des parties lu", function (indice, admin, util){
		if(admin && parties[admin]){
			if(parties[admin].messages[indice]){
				if(!parties[admin].messages[indice].lus.includes(util))
				parties[admin].messages[indice].lus.push(util);
				//partie.messages[indice].lu.push(util);
				io.sockets.emit("parties", parties);	
				let parts = [];
				for(var a in parties){
					parts.push(parties[a]);
				}
				io.sockets.emit("server-android:parties", JSON.stringify(parts));
			}
		}
	})

	socket.on("quitter partie", function(){
		console.log(user);
		if(user.pseudo == null){
			console.log("deconnexion");
			socket.emit("deconnexion");
		}
		else{
			console.log(user.pseudo," a quitté la partie créée par ", partie.admin);
			console.log("------- LA PARTIE EN QUESTION  -------");
			console.log(partie);
			//Un joueur quitte une partie
			for(var i in parties){
				if(parties[i] == partie){
					user.etat = 0;
					//La partie qui est censée etre quittée
					//On regarde si cest un admin ou pas
					if(partie.admin == user.pseudo){
						delete parties[partie.admin];
						console.log("C'est l'admin qui a fermé la partie");
					}
					else{
						parties[partie.admin].joueurs = suppr(user,parties[partie.admin].joueurs);
						var ind = position(user.pseudo,parties[partie.admin].listeJoueurs);
						parties[partie.admin].listeJoueurs = suppr(user.pseudo,parties[partie.admin].listeJoueurs);
						parties[partie.admin].listeScores = supprbypos(ind,parties[partie.admin].listeScores);
						io.sockets.emit("partie rejoint", parties[partie.admin]);
						console.log(user.pseudo+"a quitté la partie de "+partie.admin);
					}
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));
					socket.emit("fermer partie", partie, user);
				}
			}
			console.log("------- LA PARTIE EN QUESTION APRES  -------");
			console.log(partie);
			console.log("------- LES PARTIE EN COURS  -------");
			console.log(parties);
		}
	})

	socket.on("joindre partie", function (admin){
		if(!parties[admin].listeJoueurs.includes(user.pseudo)){
			user.etat = 2; //Le joueur est dans un groupe
			parties[admin].joueurs.push(user);
			parties[admin].listeJoueurs.push(user.pseudo);
			parties[admin].niveau = niveauMoyen(parties[admin].joueurs);
			parties[admin].listeScores.push(0);
			partie = parties[admin];
			console.log(user.pseudo+" a joint la partie créée par "+admin);
			io.sockets.emit("parties", parties);
			let parts = [];
			for(var a in parties){
				parts.push(parties[a]);
			}
			io.sockets.emit("server-android:parties", JSON.stringify(parts));
			io.sockets.emit("partie rejoint", parties[admin]);
		}
	})

	socket.on("check password", function (admin){
		if(parties[admin]){
			if(parties[admin].pass == ""){
				user.etat = 2; //Le joueur est dans un groupe
				parties[admin].joueurs.push(user);
				parties[admin].listeJoueurs.push(user.pseudo);
				parties[admin].niveau = niveauMoyen(parties[admin].joueurs);
				parties[admin].listeScores.push(0);
				partie = parties[admin];
				console.log(user.pseudo+" a joint la partie créée par "+admin);
				io.sockets.emit("parties", parties);
				let parts = [];
				for(var a in parties){
					parts.push(parties[a]);
				}
				io.sockets.emit("server-android:parties", JSON.stringify(parts));
				io.sockets.emit("partie rejoint", parties[admin]);
			}
			else{
				socket.emit("partie securisee", parties[admin]);
			}
		}
	})

	socket.on("ecrit", function (nom_contact){
		io.sockets.emit("ecrit", user.pseudo, nom_contact);
	})

	socket.on("fin ecrit", function (nom_contact){
		io.sockets.emit("fin ecrit", user.pseudo, nom_contact);
	})

	socket.on("ecrit partie", function (admin){
		io.sockets.emit("ecrit partie", user.pseudo, admin);
	})

	socket.on("fin ecrit partie", function (admin){
		io.sockets.emit("fin ecrit partie", user.pseudo, admin);
	})

	socket.on("lus", function (contact, messages){
		/*
		// On ajoute les messages lus dans la liste de mes messages et on les retire dans mes unreads
		chaine = fs.readFileSync("contacts", "UTF-8");
		contacts = JSON.parse(chaine);
		for(message in messages){
			contacts[user.pseudo][contact].messages.all.push(messages[message]);		
		}
		MongoClient.connect(url,{ useNewUrlParser: true },function(err, dbs) {
			db = dbs.db(dbase);
			db.collection("contact").find({}).toArray(function(err, result) {
				if (err) console.log(err);
				for(r in result){
					users[result[r].user.pseudo] = result[r].user;
				}
				res.send(JSON.stringify(users));
			});
		});

		chaine = JSON.stringify(contacts);
		fs.writeFileSync("contacts", chaine, "UTF-8");

		let unreads = {};
		chaine = fs.readFileSync("unreads", "UTF-8");
		unreads = JSON.parse(chaine);
		unreads[user.pseudo][contact] = [];		
		chaine = JSON.stringify(unreads);
		fs.writeFileSync("unreads", chaine, "UTF-8");

		socket.emit("update contacts", contacts[user.pseudo], 1);
		*/

	})

	socket.on("new message", function (message){
		/*
		chaine = fs.readFileSync("contacts", "UTF-8");
		contacts = JSON.parse(chaine);
		console.log(contacts);
		contacts[message.sender][message.receiver].messages.all.push(message);		
		console.log(contacts);
		chaine = JSON.stringify(contacts);
		fs.writeFileSync("contacts", chaine, "UTF-8");

		socket.emit("afficher", message);

		let unreads = {};
		if(fs.statSync("unreads").size > 0){
			chaine = fs.readFileSync("unreads", "UTF-8");
			unreads = JSON.parse(chaine);
			if(unreads[message.receiver]){
				if(!unreads[message.receiver][message.sender]){
					unreads[message.receiver][message.sender] = [];
				}
			}
			else{
				unreads[message.receiver] = {};
				unreads[message.receiver][message.sender] = [];
			}
			unreads[message.receiver][message.sender].push(message);		
			chaine = JSON.stringify(unreads);
			fs.writeFileSync("unreads", chaine, "UTF-8");
		}
		else{
			unreads[message.receiver] = {};		
			unreads[message.receiver][message.sender] = [];		
			unreads[message.receiver][message.sender].push(message);		
			chaine = JSON.stringify(unreads);
			fs.writeFileSync("unreads", chaine, "UTF-8");
		}
		io.sockets.emit("non-lus", unreads[message.receiver][message.sender].length, message.receiver);
		io.sockets.emit("unread", message.receiver, unreads[message.receiver]);
		*/
	})

	socket.on("unread", function (){
		/*
		let unreads = {};
		if(fs.statSync("unreads").size > 0){
			chaine = fs.readFileSync("unreads", "UTF-8");
			unreads = JSON.parse(chaine);
		}
		socket.emit("unread", user.pseudo, unreads[user.pseudo]);
		*/
	})

	socket.on("charger unread", function (pseudo){
		/*
		let unreads = {};
		if(fs.statSync("unreads").size > 0){
			chaine = fs.readFileSync("unreads", "UTF-8");
			unreads = JSON.parse(chaine);
		}
		socket.emit("charger unread", pseudo, unreads[user.pseudo]);
		*/
	})

	socket.on("contacts", function(){
		if(fs.statSync("contacts").size > 0){
			let chaine = fs.readFileSync("contacts", "UTF-8");
			contacts = JSON.parse(chaine);
		}
		MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			dbo.collection("contact").find({"contact.user.pseudo":user.pseudo}).toArray(function (err, result){
				if(err) console.log(err)
				else{
					console.log("Contacts de "+user.pseudo);
					console.log(result);
					contact = result.contact;
					socket.emit("contacts", contact, user.pseudo);
				}
			})
		});
		
	})

	socket.on("add to contact", function (nom){

		console.log("Ajout de ",nom," dans la liste des amis de ",user.pseudo);

		let contact = {};
		contact.user = users[nom];
		contact.lastConnection = new Date();
		contact.messages = {};
		contact.messages.all = [];

		MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			dbo.collection("contact").insertOne({user:user.pseudo, contact});
			contacts[user.pseudo] = {};		
			contacts[user.pseudo][nom] = contact;	
		});
		/*
		if(fs.statSync("contacts").size > 0){
			chaine = fs.readFileSync("contacts", "UTF-8");
			contacts = JSON.parse(chaine);
			if(!contacts[user.pseudo]){
				contacts[user.pseudo] = {};
			}
			contacts[user.pseudo][nom] = contact;		
			chaine = JSON.stringify(contacts);
			fs.writeFileSync("contacts", chaine, "UTF-8");
		}
		else{
			contacts[user.pseudo] = {};		
			contacts[user.pseudo][nom] = contact;		
			chaine = JSON.stringify(contacts);
			fs.writeFileSync("contacts", chaine, "UTF-8");
		}
		*/

		console.log("Ajout de ",user.pseudo," dans la liste des amis de ",nom);

		
		contact = {};
		
		contact.user = users[user.pseudo];
		contact.lastConnection = new Date();
		contact.messages = {};
		contact.messages.all = [];
		

		MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			dbo.collection("contact").insertOne({user:nom, contact});
			contacts[nom] = {};
			contacts[nom][user.pseudo] = contact;		
		});
		/*
		if(fs.statSync("contacts").size > 0){
			chaine = fs.readFileSync("contacts", "UTF-8");
			contacts = JSON.parse(chaine);
			if(!contacts[nom]){
				contacts[nom] = {};
			}
			contacts[nom][user.pseudo] = contact;		
			chaine = JSON.stringify(contacts);
			fs.writeFileSync("contacts", chaine, "UTF-8");
		}
		else{
			contacts[nom] = {};		
			contacts[nom][user.pseudo] = contact;		
			chaine = JSON.stringify(contacts);
			fs.writeFileSync("contacts", chaine, "UTF-8");
		}*/
		
		console.log("{{{{{{{{{{{{   contacts    }}}}}}}}}}}}}}}");
		console.log(contacts);
		
		io.sockets.emit("contacts",contacts[user.pseudo],user.pseudo);
		io.sockets.emit("contacts",contacts[nom], nom);
	})

	/*
	*	@inscription d'un nouvel utilisateur. 
	*/

	/*
	*	
	*	Vérification des informations
	*
	*/
	socket.on("verif_data", function (data){
		var ret = 0;
		console.log("=============== Vérification des données ============");
		data.username = data.username.trim();
		data.telephone = data.telephone.replace(/ /g, "");
			
		let user = {};
		let contenu;
		socket.emit("message", "On est entrain verifier les donnees !");

		MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			// let name = /^data.username$/i;
			dbo.collection("user").find({"user.pseudo":data.username}).collation( { locale: 'en', strength: 1 } ).toArray(function (err, result){
				if(result.length == 0){
					dbo.collection("user").find({"user.tel":data.telephone}).toArray(function (err, result2){
						if(result2.length == 0){
							console.log("Génération du code SMS");
							genererCode(data);	
							socket.emit("verif_username_rep", 0);
						}
						else{
							socket.emit("message", "Ce numéro de téléphone est deja utilisé.");
							socket.emit("verif_username_rep", 2);
							console.log("Tel Deja utilisé ...")
						}
					});
				}
				else{
					dbo.collection("user").find({"user.tel":data.telephone}).toArray(function (err, result2){
						if(result2.length == 0){		
							socket.emit("message", "Ce pseudo est deja utilisé.");
							socket.emit("verif_username_rep", 1);
							console.log("Pseudo Deja utilisé ...")
						}
						else{
							dbo.collection("user").find({"user.pseudo":data.username, "user.tel":data.telephone}).collation( { locale: 'en', strength: 1 } ).toArray(function (err, result3){
								// Il s'agit d'une connexion
								if(result3.length == 0){		
									// Elle a échouée
									socket.emit("message", "Le pseudo ne correspond pas à ce numéro. Essayez "+result2[0].user.pseudo);
									socket.emit("verif_username_rep", 3, result2[0].user.pseudo);
									console.log("Erreur de connexion ...")
								}
								else{
									console.log(result3[0]);
									users[data.username] = result3[0].user;
									user = result3[0].user;
									console.log(user);
									resultat(user);
								}
							});
						}
					});
				}
			})
		});
	})
	socket.on("confirmation numero suite", function (code,tel){
		// console.log(tels);
		if(tels[tel]){
			if(tels[tel].code == code){
				//Inscription
				var ret = inscription(tels[tel].user, tels[tel].tel);
				if(ret == 0){
					// console.log("Nouvelle inscription : "+tels[tel].user);
				}
				else{
					// console.log("Problème lors de l'inscription de "+tels[tel].user);
				}
			}
			else{
				//Erreur
				socket.emit("code incorrect");
			}
		}
		else{
			socket.emit("erreur tel", tels, tel);
			socket.emit("message", "Erreur : "+tels +tel);
		}
	})


	function resultat(user){
		user = user;
		console.log("Données");
		socket.emit("donnees", user);
	}
	socket.on("donnees", function (utilisateur){
		user = utilisateur;
	
		MongoClient.connect(
			url,{ useNewUrlParser: true },
			function(err, dbs) {
				console.log(err);
				if(!err) {
					db = dbs.db(dbase);					
					db.collection("user").find({}).toArray(function(err, result) {
						if (err) console.log(err);
						console.log("Message envoyé")
						socket.emit("nouvel utilisateur", user, result.length);
						socket.emit("gotopage", "./parties");
					});
				} else {
					console.log("Error while connecting to MongoDB");
				}
			}
		);
		
	})

	socket.on("donnees partage", function (user){
		socket.emit("donnees partage",user);
	})

	function genererCode(data){
		tel = data.telephone;
		username = data.username;
		var ret = 0;
		var code = nombre_aleatoire(10000, 99999);
		let telephone = {};
		
		
		telephone.tel = tel;
		telephone.code = code;
		telephone.date = new Date();
	
		if(tels[tel]){
			delete tels[tel];
		}

		tels[tel] = {
			'user':username,
			'code':code, 
			'tel':tel,
			'all':telephone
		}
		
		
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			var secondUser = {};
			dbo.collection("telephone").insertOne({tel:tels[tel]});
		});
		// console.log("*********** TELS ****************");
		// console.log(tels);
		console.log("=============== Génération du code ============");
		console.log("Numero : "+tel+" ----- Code : "+code);
		socket.emit("confirmation numero", tel, code);	
	}

	function nombre_aleatoire(min, max) {
	  let alea = Math.floor((max - min) * Math.random()) + min;
	  return alea; // retourne un nombre
	}

	socket.on("verif_username", function (username){
		infos_user(username);
	});

	socket.on("inscription", function(username, password, idquestion, reponse){
		var ret = inscription(username, password, idquestion, reponse);
		if(ret == 0){
			// console.log("Nouvelle inscription : "+username);
			socket.emit("nouvel utilisateur", username);
			socket.emit("gotopage", "parties.html");
		}
		else{
			// console.log("Problème lors de l'inscription de "+username);
		}
	})

	function inscription (username, tel){
		let user = {};
		let ret = 1;
		let chaine;
		
		user.pseudo = username.replace(/ /g, "").trim();
		user.tel = tel.replace(/ /g, "");
		user.niveau = 1;
		user.score = 0;
		user.parties = 0;
		user.rang = users.length;
		user.pays = '';
		user.email = '';
		user.password = '';
		user.langue = 'francais';
		user.derniereConnexion = new Date();
		user.date = new Date();


		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			var secondUser = {};
			dbo.collection("user").find({"user.pseudo":user.pseudo}).toArray(function (err, result){
				if(result.length == 0){
					dbo.collection("user").find({"user.tel":user.tel}).toArray(function (err, result2){
						if(result2.length == 0){
							dbo.collection("user").insertOne({user});
							console.log("Enregistré");
							user.pseudo = user.pseudo;
							users[username] = user;
							resultat(user);
						}
						else{
							console.log("Tel Deja utilisé ...")
							ret = 0;
						}
					});
				}
				else{
					ret = 0;
					console.log("Pseudo Deja utilisé ...")
				}
			})
		});
		return ret;
	}

	/*
	* 	Communication avec Android
	*/

	socket.on("android-server:donnees_utilisateur", function (json){
		let username = JSON.parse(json).username;
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			db.db(dbase).collection("user").find({"user.pseudo":username}).toArray(function (err, result){
				socket.emit("server-android:donnees_utilisateur", JSON.stringinfy(result[0]['user']));
			})
		});
	});

	socket.on("android-server:premier_formulaire", function (json){
		console.log(json);
		console.log(JSON.parse(json));
		let num = JSON.parse(json).num;
		//let langue = JSON.parse(json).langue;
		let username = JSON.parse(json).username;
		let password = JSON.parse(json).password;

		if(num == 0){
			// Inscription
			user = {};
			let ret = 1;
			let chaine;
			
			user.pseudo = username.replace(/ /g, "").trim();
			user.password = password.replace(/ /g, "").trim();
			user.langue = 'francais';
			user.tel = "";
			user.rang = users.length;
			user.niveau = 1;
			user.score = 0;
			user.parties = 0;
			user.pays = '';
			user.email = '';
			user.derniereConnexion = new Date();
			user.date = new Date();
			MongoClient.connect(url, function(err, db) {
				if (err) console.log(err);
				db.db(dbase).collection("user").find({"user.pseudo":user.pseudo.toLowerCase()}).toArray(function (err, result){
					if(result.length == 0){
						// La personne n'est pas encore enregistrée, on va à la page suivante
						console.log(result);
						console.log("Pas encore existant");
						let email = JSON.parse(json).email;
						user.email = email;						
						db.db(dbase).collection("user").insertOne({user});
						socket.emit("message","Enregistré");
						users[user.pseudo] = user;
						resultat(user);
						socket.emit("server-android:second_formulaire", false);
						socket.emit("server-android:premier_formulaire", false, num);
					}
					else{
						ret = 0;
						console.log("existant");
						socket.emit("message","Pseudo Deja utilisé ...");
						socket.emit("server-android:premier_formulaire", true, num);
					}
				})
			});
		}
		else{
			//Connexion
			MongoClient.connect(url, function(err, db) {
				if (err) console.log(err);
				db.db(dbase).collection("user").find({"user.pseudo":username.toLowerCase(), "user.password":password}).toArray(function (err, result){
					if(result.length == 0){
						// Identifiant inconnus
						socket.emit("server-android:premier_formulaire", true, num);
					}
					else{
						let user = result[0]['user'];
						rangUser(user);
						socket.emit("server-android:premier_formulaire", false, num);
						socket.emit("server-android:user", JSON.stringify(user));
						let parts = [];
						for(var a in parties){
							parts.push(parties[a]);
						}
						io.sockets.emit("server-android:parties", JSON.stringify(parts));
					}
				})
			});
		}
	})
	socket.on("android-server:parties", function (){
		let parts = [];
		for(var a in parties){
			parts.push(parties[a]);
		}
		io.sockets.emit("server-android:parties", JSON.stringify(parts));
	})
	socket.on("android-server:second_formulaire", function (json, callback){
		let email = JSON.parse(json).email;
		user.email = email;
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			db.db(dbase).collection("user").insertOne({user});
			socket.emit("message","Enregistré");
			users[user.pseudo] = user;
			resultat(user);
			socket.emit("server-android:second_formulaire", false);
		});
	});




	socket.on("connexion json", function (utilisateur){
		user = utilisateur;
		user.derniereConnexion = ''+new Date();
		name = user.pseudo;
		console.log(name," vient de se connecter.");
		MongoClient.connect(url, function(err, db) {
			if (err) console.log(err);
			var dbo = db.db(dbase);
			dbo.collection("user").find({"user.pseudo":user.pseudo}).toArray(function (err, result){
				if(result.length == 0){
					socket.emit("deconnexion");
				}
				else{
					console.log("Connexion de "+user.pseudo);
					console.log("@@@ Mise a jour des données");
					MongoClient.connect(url, { useNewUrlParser: true },function(err, db) {
						if (err) console.log(err);
						var dbo = db.db(dbase);
						dbo.collection("user").update({"user.pseudo":user.pseudo},{"user":user});
					});
					utilisateursConnectes[name] = user; 
					io.sockets.emit("utilisateur connecte", utilisateursConnectes, socket.socketID);
					io.sockets.emit("parties", parties);
					let parts = [];
					for(var a in parties){
						parts.push(parties[a]);
					}
					io.sockets.emit("server-android:parties", JSON.stringify(parts));
					socket.emit("contacts", contacts[user.pseudo], user.pseudo);
				}
			})
		});	
	})

	function connexion (username, password){
		var sql = "SELECT * FROM molux_user WHERE pseudo = ? AND password = ?";
		var values = [username, password];
		con.query(sql, [values], function (err, result, fields) {
			if (err) console.log(err);
			if(result){
				user = result;
				users["user"+result.id] = result;
				socket.emit("connexion", result);	
				socket.emit("gotopage", "parties.html");
			}
			else {
				socket.emit("probleme connexion");
			}
		});
	
	}

	function rangUser(utilisateur){
		db.collection("user").find({}).toArray(function(err, result) {
			if (err) console.log(err);
			console.log("Recherche du rang -- ");
			let rang = 1;
			let score = utilisateur.score;
			let max = score;
			for(r in result){
				let user = result[r].user;
				if(user.score > score){
					rang++;
				}					
			}
			dbo.collection("user").update({"user.pseudo":utilisateur.pseudo},{"user.rang":rang});
			socket.emit("rang", rang);
		});
	}

	function supprbypos(a, tab){

		var i;

		for(i=a ; i<tab.length ; i++){

			tab[i] = tab[i+1];

		}

		tab.pop();
		return tab;

	}

	function suppr(elt, tab){

		var i, a=-1;

		for(i=tab.length-1 ; i>=0 ; i--)

			if(tab[i] == elt)

			{

				a = i;

			}

		if(a != -1){				

			for(i=a ; i<tab.length ; i++){

				tab[i] = tab[i+1];

			}

			tab.pop();

		}

		return tab;
	}
	function position(elt, tab){

		var i, a=-1;

		for(i=tab.length-1 ; i>=0 ; i--)

			if(tab[i] == elt)

			{

				a = i;

			}

		return a;

	}
	function in_array_attribut(variable, tableau, attribut){
		var ret = 0;
		for(var nom in tableau){
			if(tableau[nom][attribut] == variable){
				ret = 1;
				break;
			}
		}
		return ret;
	}
});
http.listen(port);


// // 
// if(!sticky.listen(server, port)){
// 	server.once('listening', function (){
// 		console.log("start on port "+port);
// 	})
// 	if(cluster.isMaster){
// 		console.log("Master serve on port "+port);
// 	}
// }
// else{
// 	console.log("Child port: "+ port+ " -- ID "+cluster.worker.id);
// }


function niveauMoyen(joueurs){
	var niveau = 0;
	for(var i in joueurs){
		joueur = joueurs[i];
		niveau += joueur.niveau;
	}
	return (niveau / joueurs.length).toFixed(2);
}

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
