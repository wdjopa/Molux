var versionAPK=3;
var tel = 0;

var points = {
	"A":1,
	"B":3,
	"C":4,
	"D":1,
	"E":1,
	"F":1,
	"G":1,
	"H":2,
	"I":1,
	"J":6,
	"K":5,
	"L":1,
	"M":1,
	"N":1,
	"O":2,
	"P":2,
	"Q":7,
	"R":2,
	"S":1,
	"T":1,
	"U":1,
	"V":1,
	"W":6,
	"X":7,
	"Y":7,
	"Z":4
};

function calculer(mot){
	let total = 0;
	for(let i=0;i<mot.length;i++){
		let lettre = mot[i].toUpperCase();
		total += points[lettre];
	}
	return total;
}

if(window.matchMedia("(min-width:800px)").matches) {

	var port = 5000;
	var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
	if(host.includes("localhost")){
		host+=":";
	}
	host+=port;
	var socket = io.connect("/");		
	var cookie_user = getCookie('user');
	var params = getParameters();
	//console.log(cookie_user);
	var user = JSON.parse(cookie_user);
	var partie_en_cours;
	var game = {};
	var debut = new Date();
	var pause = 1, duree = 60*3, seconds=duree;
	var motP, motsUtilises = [];
	var motsFormesSomme = 0;
	var audios = {};
	var totalParties = 0;

	Notification.requestPermission();

	if(cookie_user == ""){
		//Premiere connexion
		window.location.href="index.html";
	}

	if(document.location.href.includes("=")){
		adminInvite = document.location.href.split("=")[1];
		partie(adminInvite);
	}
	
	audios.clavier = {};
	audios.clavier.src = ["../Audios/clavier.wav"];
	audios.clavier.play = function (indice=0){
		_("audio.tonalite").src = this.src[0]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play();
	}

	audios.partie = {};
	audios.partie.src = ["../Audios/debut partie.mp3", "../Audios/nouvelle partie.wav"];
	audios.partie.play = function (indice=0){
	//	alert(indice);
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.player = {};
	audios.player.src = ["../Audios/player.mp3"];
	audios.player.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.erreur = {};
	audios.erreur.src = ["../Audios/erreur.mp3","../Audios/error.mp3","../Audios/error.ogg"];
	audios.erreur.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.gameOver = {};
	audios.gameOver.src = ["../Audios/game over.wav"];
	audios.gameOver.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.close = {};
	audios.close.src = ["../Audios/wind.mp3"];
	audios.close.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}

	audios.game = {};
	audios.game.src = ["../Audios/valid.mp3","../Audios/error.mp3"];
	audios.game.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}

	audios.temps = {};
	audios.temps.src = ["../Audios/temps.mp3"];
	audios.temps.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}
	audios.temps.stop = function (){
		_("audio.tonalite").pause(); 
		_("audio.tonalite").currentTime = 0;
	}

	audios.melange = {};
	audios.melange.src = ["../Audios/melanger.mp3","../Audios/melanger2.mp3"];
	audios.melange.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.start = {};
	audios.start.src = ["../Audios/start.mp3"];
	audios.start.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.souris = {};
	audios.souris.src = ["../Audios/souris.mp3"];
	audios.souris.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}


	socket.on("deconnexion", function(){
		deconnexion();
	})
	
	//Saisie clavier
	var	tapkey = 0;
	var uses = [];

	function checkEvent( _event_ ){
		if ( window.event )
			return window.event;
		else
			return _event_;
	}
	function clavier(_event_){
		if(partie_en_cours.admin){
			if(partie_en_cours.etat == 1){
				let key = checkEvent(_event_).key, spans = document.querySelectorAll(".large-screen .lettres .lettre .valeur .valeur2"), elts= document.querySelectorAll(".large-screen .lettres .lettre"),letters = [], lettres = [], soluce = "";
				for(let i=0;i<spans.length;i++){
					letters[i] = {};
					letters[i].val = spans[i].innerHTML;
					lettres[i] = spans[i].innerHTML;
					letters[i].id = elts[i].id;
				}
				
				if(lettres.includes(key.toUpperCase()) && tapkey == 1){	
					if(partie_en_cours.parametres.pluralite == 'non'){
						for (let index = lettres.indexOf(key.toUpperCase());index >= 0; index = lettres.indexOf(key.toUpperCase(), index + 1)) {
							if(!uses.includes(letters[index].id)){
								useLettre(letters[index].id);
								uses.push(letters[index].id);
								break;
							}
						}
					}
					else{
						useLettre(letters[lettres.indexOf(key.toUpperCase())].id);
					}
				}
				
				if (checkEvent(_event_).keyCode == 13 && tapkey == 1){
					valider_proposition();
				}
				if (checkEvent(_event_).keyCode == 46 || checkEvent(_event_).keyCode == 8 && tapkey == 1){
					retirerTout();
				}
			}
			else{
				if (checkEvent(_event_).keyCode == 13 && tapkey == 1){
					sendMessageInParties();
				}
			}
		}
		
	}

	// function ouvrir(link){
	// 	document.location.href = "http://molux.eu-4.evennode.com/"+link;
	// }
	
	function ouvrirParametres(){
		_(".large-screen .second-screen").style.transform = 'scale(1)';
		_(".large-screen .second-screen .cadre").style.display = 'none';
		_(".large-screen .second-screen .parametres").style.display = 'flex';
	}

	function fermerParametres(){
		_(".large-screen .second-screen").style.transform = 'scale(0)';
	}


	socket.on('connect', function () {
		// console.log("Connexion avec le serveur.");
		socket.emit("connexion json",user);
		document.querySelector("title").innerHTML = "MOLUX - "+user.pseudo;
		
		Bulle('Connexion');
	});

	socket.on("message", function (message){
		// console.log(message);
		Bulle('Nouveau Message : '+message);
	})

	socket.on('disconnect', function () {
		Bulle('Vous avez été déconnecté du serveur');
		//new Notification("Molux", {"body":"Vous avez été déconnecté !","dir":"auto","icon":"https://www.tchatat.fr/molux/favicon.ico"})		
		console.log("Déconnexion avec le serveur.");
	});

	socket.on("replace partie", function (name, part){
		if(partie_en_cours.admin == name){
			partie_en_cours = part;
			console.log("changement dadmin");
			let g;
			g = game;
			// console.log(game);
			// console.log(part);
			game.admin = part.admin;
			socket.emit("replace partie", name, part);
		}
	});

	function accueil(){
		/*
		game = {};
		duree = 10;
		$(".large-screen section").fadeOut();
		$(".large-screen .page-creation").fadeIn();
		_(".large-screen .page-partie .niveau-2 .container-niveau-2").innerHTML = "";*/
		document.location.href="parties";
	}

	socket.on("non-lus", function (nombreMessages, username){
		if(username == user.pseudo){
			audios.partie.play(1);
			_(".large-screen .header-joueurs .niveau-2").innerHTML = '<span class="notification">'+nombreMessages+'</span>';
		}
	})

	socket.emit("unread");

	socket.on("unread", function (username, unreads){
		if(username == user.pseudo){
			let messagesNonLus = 0;
			for(name in unreads){
				messagesNonLus+=unreads[name].length;
			}
			
			if(messagesNonLus > 0){
				if(messagesNonLus == 1){
					_("title").innerHTML = user.pseudo + " ("+messagesNonLus+" message non lus) - MOLUX";
				}
				else{
					_("title").innerHTML = user.pseudo + " ("+messagesNonLus+" messages non lus) - MOLUX";
				}
				socket.emit("non-lus", messagesNonLus, user.pseudo);
			} 
		}
	})

	function fin(){
		//alert("la fin");
		//console.log(partie_en_cours);
		//console.log(game);
		$(".large-screen .page-jeu").fadeOut();
		$(".large-screen .page-fin-jeu").fadeIn();
		user.score+=game.score;
		user.parties++;
		user.niveau = parseInt(user.score/100) + 1;
		setCookie("user", JSON.stringify(user), 10);
		socket.emit("end game", game);
	}

	function sendMessageInParties(){
		let messageText = _(".large-screen .response-input").textContent;
		if(messageText.replace(/<br>/g,'').trim() != ""){
			let message = {};
			message = {
				sender: user.pseudo,
				date: new Date(),
				texte: verifyMessage(escapeHTML(messageText)),
				lus:[user.pseudo]
			}
			socket.emit("message des parties", message, partie_en_cours.admin);
		}
		scroll();
		_(".large-screen .response-input").focus();
		setTimeout(clean, 100);
	}

	function verifyMessage(texte){
		let t = " ";
		let textes = texte.split(" ");
	//	console.log(textes);
		for(let i=0;i<textes.length;i++){
			let mot = textes[i];
			t+=URL(mot)+" ";
		//	console.log(t);
		}
		return t;
	}

	function URL(texte){
		let reg = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,}/;
		let regex = new RegExp(reg);

		if (texte.match(regex)) {
			let a;
			if(texte.includes("http")){
				a = '<a href="'+texte+'" target="_blank" class="message-link">';
			}
			else{
				a = '<a href="http://'+texte+'" target="_blank" class="message-link">';
			}
			a+=texte+"</a>";
			return a;		
		} else {
			return texte;
		}
	}
	function clean(){
		_(".large-screen .response-input").innerHTML = "";		
	}
	function escapeHTML(html) {
		return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
	}

	function copyToClipboard(obj)
	{
		let elt = document.createElement("textarea");
		elt.value = obj;
		elt.id = "textarea-large";
		_(".large-screen").appendChild(elt);
		document.getElementById("textarea-large").select();
		console.log(obj)  
		document.execCommand("copy");
	}

	function invite(){
		let lien = "";
		for (let i=0; i < document.location.href.split("/").length - 1; i++){
			lien += document.location.href.split("/")[i] + "/";
		}
		lien += "=" + user.pseudo;
		console.log(lien);
		copyToClipboard(lien);
	}
	
 	var MesmessagesNonLus = [];
	
	socket.on("message des parties", function(admin){
		if(partie_en_cours.admin){
			if(partie_en_cours.admin == admin){
				let messages = partie_en_cours.messages;
			//	console.log(messages);
				let a = 0
				_(".large-screen .chat .contain").innerHTML = "";
				if(_(".large-screen .live-chat").style.display == "flex"){
					//Le chat est ouvert, donc il a tout lu
					for(let i=0;i<messages.length;i++){
						addMessage(messages[i]);
						socket.emit("message des parties lu", i, admin, user.pseudo);
					}
					scroll();
				}
				else{
					//On indique le nombre de messages non lus
					MesmessagesNonLus = [];
					for(let i=0;i<messages.length;i++){
						addMessage(messages[i]);
						if(!messages[i].lus.includes(user.pseudo))
						MesmessagesNonLus.push(i);
					}
				}
				if(MesmessagesNonLus.length <= 0){
					_(".large-screen .notif").style.display = "none";
					audios.game.play(0);
				}
				else{
					_(".large-screen .notif").style.display = "flex";
					_(".large-screen .notif").innerHTML = MesmessagesNonLus.length;
					audios.partie.play(0);
					//new Notification("Molux - Nouveau Message", {"body":MesmessagesNonLus.length+" messages non lus dans la partie de "+admin,"dir":"auto","icon":"https://www.tchatat.fr/molux/favicon.ico"})
				}
			//	console.log(MesmessagesNonLus);
			}
		}	
	})

	var ecriture;


	function ecrit(_event_){
		let key = checkEvent(_event_);
		if (key.keyCode == 13){
			sendMessageInParties();
		}
		else{
			clearTimeout(ecriture);
			socket.emit("ecrit partie", partie_en_cours.admin);
			ecriture = setTimeout(function (){
				socket.emit("fin ecrit partie",  partie_en_cours.admin);
			}, 1000);
		}
	}

	socket.on("ecrit partie", function(nom_contact, admin){
		if(partie_en_cours.admin == admin && nom_contact != user.pseudo){
			if(!_(".large-screen .box-messages .entete .titre i"))
			_(".large-screen .box-messages .entete .titre ").innerHTML += "<i>"+nom_contact.split(" ")[0]+" est entrain d'écrire ...</i>";
		}
	});
	
	socket.on("fin ecrit partie", function(nom_contact, admin){
		if(partie_en_cours.admin == admin){
			if(_(".large-screen .box-messages .entete .titre i"))
				_(".large-screen .box-messages .entete .titre").removeChild(_(".large-screen .box-messages .entete .titre i"));
		}
	});

	function openChat(){
		_(".large-screen .live-chat").style.display = "flex";
		_(".large-screen .response-input").focus();
		for(let a=0;a<MesmessagesNonLus.length;a++){	
			socket.emit("message des parties lu", MesmessagesNonLus[a], partie_en_cours.admin, user.pseudo);
		}
		MesmessagesNonLus = [];		
		socket.emit("open chat", partie_en_cours.admin);
		scroll();
	}
	
	function closeChat(){
		_(".large-screen .live-chat").style.display = "none";
	}
	
	function scroll(){
		$('.large-screen .chat').animate({scrollTop : $('.large-screen .chat').prop('scrollHeight')}, 500);
		_(".large-screen .response-input").focus();
	}
	
	function addMessage(message){

		let bloc = create("div");
		let line = create("div");
		let a = create("a");
		let nom = create("span");
		let heure = create("span");
		let date = create("div");
		let messageDiv = create("div");
		let pDiv = create("p");

		if(user.pseudo == message.sender)
			bloc.setAttribute("class","bloc you");
		else
			bloc.setAttribute("class","bloc other");

		line.setAttribute("class", "line-1");
		a.setAttribute("class", "user");
		date.setAttribute("class", "date name");
		nom.setAttribute("class", "nom");
		heure.setAttribute("class", "heure");
		messageDiv.setAttribute("class", "message");
		a.href = "";

		a.innerHTML = message.sender[0].toUpperCase();
		pDiv.innerHTML = message.texte;
		nom.innerHTML = message.sender;
		heure.innerHTML = direDate(message.date);

		date.appendChild(nom);
		date.appendChild(heure);
		line.appendChild(a);
		line.appendChild(date);
		messageDiv.appendChild(pDiv);
		bloc.appendChild(line);
		bloc.appendChild(messageDiv);

		_(".large-screen .chat .contain").appendChild(bloc);
	}	
	

	socket.on("end game", function (partie){
		if(partie.admin == partie_en_cours.admin){
			let rang = 1;
			let a = 0;
			let b = 0;

			partie.classement.forEach(function (user){
				addPersonneClassement(user, rang);
				rang++;
			})
			partie.motsTrouves.forEach(function (mot){
				addMotFin(mot, 'all');
				b++;
			})
			game.listeMots.forEach(function (mot){
				addMotFin(mot, 'self');
				a++;
			})
			
			_(".large-screen .mes-mots .total-mots").innerHTML = a;
			_(".large-screen .mots-restants .total-mots").innerHTML = b;

			_(".large-screen section.page-fin-jeu .corps .right .boutons .btn").setAttribute("onclick", "accueil()");
			partie_en_cours = {};
			let AllMots = mots(partie.lettres.join(""));
			//console.log(AllMots);
		}
		
	})

	function addPersonneClassement(personne, rangR){
		let userDiv = create("div");
		let rang = create("span");
		let nom = create("span");
		let total = create("span");
		userDiv.setAttribute("class", "user");
		total.setAttribute("class", "points");
		nom.setAttribute("class", "nom");
		rang.setAttribute("class", "num");
		nom.innerHTML = personne.user;
		total.innerHTML = personne.score+ " pts";
		rang.innerHTML = rangR+".";
		userDiv.appendChild(rang)
		userDiv.appendChild(nom)
		userDiv.appendChild(total)
		_(".large-screen .c-classement").appendChild(userDiv);
	}

	function addMotFin(mot, place){
		let motDiv = create("div");
		let valeurSpan = create("span");
		motDiv.setAttribute("class", "mot");
		valeurSpan.setAttribute("class", "valeur");
		valeurSpan.innerHTML = mot;
		motDiv.appendChild(valeurSpan);
		_(".large-screen .page-fin-jeu ."+place).appendChild(motDiv);
	}

	function creer_partie(){
		document.querySelector("body").onkeyup = ecrit;
		fermerParametres();
		_(".large-screen .create.valid-btn").removeAttribute("onclick");
		_(".large-screen .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		$(".large-screen .page-creation").fadeOut();
		$(".large-screen .page-partie").fadeIn();
		_(".large-screen .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
		_(".large-screen .chat .contain").innerHTML = "";
		$(".large-screen .niveau-1.admin").fadeIn();		
		//Création de partie
		var partie = {};
		partie.admin = user.pseudo;
		partie.date = new Date();
		partie.pass = _(".large-screen .second-screen .key").value;
		partie.parametres = {};
		partie.parametres.temps = _(".large-screen .second-screen .temps .val").innerHTML;
		partie.parametres.pluralite = _(".large-screen .second-screen .pluralite .val").innerHTML.toLowerCase();
		partie.parametres.mode = _(".large-screen .second-screen .mode .val").innerHTML.toLowerCase();
		partie.parametres.langue = _(".large-screen .second-screen .langue .val").innerHTML.toLowerCase();
		socket.emit("creer partie", partie);
	}


	function nombre_aleatoire(min, max) {
		let alea = Math.floor((max - min) * Math.random()) + min;
		return alea; // retourne un nombre
	  }
  
	function genererCle(){
		let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let chaine = "";
		do{
			chaine+=alphabet[nombre_aleatoire(0,alphabet.length)].toUpperCase();
		}while(chaine.length<8);
		chaine = chaine.split('').sort(function(){return 0.5-Math.random()}).join('');
		_(".large-screen .second-screen .key").value = chaine;
	}

	function changeTime(signe){
		let temps = parseInt(_(".large-screen .second-screen .temps .val").innerHTML);
		if(signe == '+'){
			if(temps >= 300){
				temps = 300;
			}
			else{
				temps+=30;
			}
		}
		else{
			if(temps <= 30){
				temps = 30;
			}
			else{
				temps-=30;
			}	
		}
		_(".large-screen .second-screen .temps .val").innerHTML = temps;
	}

	function changePluralite(){
		let mot =  _(".large-screen .second-screen .pluralite .val").innerHTML.toLowerCase();
		if(mot == 'oui'){
			_(".large-screen .second-screen .pluralite .val").innerHTML = "Non";
		}
		else{
			_(".large-screen .second-screen .pluralite .val").innerHTML = "Oui";
		}
	}

	function changeMode(){
		let mot =  _(".large-screen .second-screen .mode .val").innerHTML.toLowerCase();
		if(mot == 'classique'){
			_(".large-screen .second-screen .mode .val").innerHTML = "Tournoi";
		}
		else{
			_(".large-screen .second-screen .mode .val").innerHTML = "Classique";
		}
	}

	function changeLangue(){
		let mot =  _(".large-screen .second-screen .langue .val").innerHTML.toLowerCase();
		if(mot.toLowerCase() == 'francais'){
			_(".large-screen .second-screen .langue .val").innerHTML = "Anglais";
		}
		else{
			_(".large-screen .second-screen .langue .val").innerHTML = "Francais";
		}
	}


	socket.on("deconnexion", function(){
		window.location.reload();
		// document.location.href="accueil.html";
	})

	socket.on("parties", function (parties){
		let a = 0; // a > 0 signiife qu'il y'a plusieurs parties en cours
		let b = 0; // b = 1 signifie que le joueur a une partie en cours
		document.querySelector(".large-screen .les-parties").innerHTML = '';	
		for(var admin in parties){
			if(parties[admin].admin != user.pseudo){
				_(".large-screen .aucune-partie").style.display = 'none';
				if(parties[admin].etat == 0){
					//etat = 0 signifie la partie est encore disponible
					addPartie(parties[admin]);
					a++;
				}
			}
			if(parties[admin].listeJoueurs.includes(user.pseudo)){
				partie_en_cours = parties[admin];
				b = 1;
				a++;
			}
		}
		if(a > totalParties){
			totalParties = a;
			audios.partie.play(1);
		}
		if(a == 0){
			_(".large-screen .aucune-partie").style.display = 'inline-block';
			document.querySelector(".large-screen .les-parties").innerHTML = '';	
			$(".large-screen .page-creation").fadeIn();
			$(".large-screen .page-partie").fadeOut();
		}
		if(b == 0){
			_(".large-screen .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
			_(".large-screen .create.valid-btn").innerHTML = 'Créer une partie';
			partie_en_cours = {};
		}
		user.etat = b;
	});
		
	socket.on("partie rejoint", function (partie){
		if(partie.listeJoueurs.includes(user.pseudo)){
			$(".large-screen .page-creation").fadeOut();
			$(".large-screen .page-partie").fadeIn();
			_(".large-screen .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
			_(".large-screen .commencer").innerHTML = "COMMENCER";
			partie_en_cours = partie;
			//console.log(partie_en_cours);
			for(var i=0;i<partie.joueurs.length;i++){
				/*if(partie.joueurs[i].pseudo == user.pseudo){
					let p = partie.joueurs[i];
					p.pseudo = "Vous";
					p.pseudo = "Vous";
					addPersonne(p);
				}
				else{
				}*/
				addPersonne(partie.joueurs[i]);
			}
			//_(".live-chat").style.display = "none";
			socket.emit("open chat", partie_en_cours.admin);
		}
	})

	socket.on("fermer partie", function (partie, utilisateur){
		window.location.reload();
		partie_en_cours = partie;
		user = utilisateur;
		$(".large-screen .page-creation").fadeIn();
		$(".large-screen .page-partie").fadeOut();
		_(".large-screen .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
		_(".large-screen .create.valid-btn").innerHTML = 'Créer une partie';
	})

	socket.on("suppression partie", function (admin){
		if(partie_en_cours.admin){
			if(partie_en_cours.admin == admin){		
				fermer_partie();
				//user.etat = 0;
				//socket.emit("update user", user);
			}
		}
	})

	socket.on("partie prete", function (part){
		if(partie_en_cours.admin == part.admin){
			partie_en_cours = part;
			let elt = _(".large-screen .commencer.inactive");
			elt.removeAttribute("class");
			elt.setAttribute("class", "commencer active");
			elt.setAttribute("onclick", "ready()");
			audios.start.play();
		}
	})

	function ready(){
		let elt = _(".large-screen .commencer.active");
		elt.removeAttribute("class");
		elt.setAttribute("class", "commencer inactive");
		_(".large-screen button.commencer").removeAttribute("onclick");
		_(".large-screen button.commencer").innerHTML ='<img class="loader" src="Images/eclipse-loader.svg"/>';
		socket.emit("ready");
	}

	socket.on("partie en cours", function (partie){
		if(partie_en_cours.admin == partie.admin)
			partie_en_cours = partie;
	})

	socket.on("lancement de la partie", function (partie){
		// alert("partie_en_cours = partie de "+partie_en_cours.admin);
		// alert("Lancement de la partie de "+ partie.admin);
		if(partie_en_cours.admin == partie.admin){
			$(".large-screen .regles").fadeOut();
			partie_en_cours = partie;
			game.username = user.pseudo;
			game.admin = partie_en_cours.admin;
			game.listeMots = [];
			game.score = 0;
			socket.emit("occupe");
			init();
		}
	})



	function init(){
		document.querySelector("body").onkeyup = clavier;

		audios.partie.play(0);
		//_(".large-screen .corps .min-possibilites .valeur").innerHTML = partie_en_cours.lettres.length;
		afficher_lettres(partie_en_cours.lettres);
		pause = 0;
		tapkey = 1;
		compteur(partie_en_cours.parametres.temps,".large-screen .header .temps .valeur");

		// M.toast({html: "N'oubliez pas de signaler un bug. Pensez aussi à faire un screenshoot please."});
		audios.game.play(1);
	}

	function mix(){
		retirerTout();
		let z = document.querySelector(".large-screen .page-jeu .niveau-2 .lettres");
		let a = document.querySelectorAll(".large-screen .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(".large-screen .page-jeu .niveau-2 .lettres .lettre .valeur");
		for(let i=0;i<a.length;i++){
			z.removeChild(a[i]);
		}
		a = melange(a);// Melange est dans le fichier script.js
		for(let i=0;i<a.length;i++){
			z.appendChild(a[i]);
		}
	}
	    
	function melange(elt){ 
		audios.melange.play(1); 
	    let longueur = elt.length, i = 0, nouveau = new Array();
	    nombre = parseInt((Math.random().toFixed(1) * longueur));
	    while(elt[i]){
	        while(nouveau[nombre] || nombre < 0|| nombre > longueur-1){
	            nombre = parseInt((Math.random().toFixed(1) * longueur));
	        }
	        //console.log("Nombre:"+nombre);
	        //console.log(nouveau);
	        nouveau[nombre] = elt[i];
	        i++;
	    }
	    return nouveau;
	}

	function useLettre(idlettre){
		audios.clavier.play();
		_(".large-screen .niveau-1.proposes .proposition").style.height = "100%";
		_(".large-screen .niveau-1.proposes .proposition .erreur").style.opacity="0";
		if(partie_en_cours.parametres.pluralite == 'non'){
			_(".large-screen #"+idlettre+" .valeur").style.transform = "scale(0)";
			_(".large-screen #"+idlettre).removeAttribute("onclick");
			var letterSpan = _(".large-screen #"+idlettre);
			var letter = _(".large-screen #"+idlettre+" .valeur .valeur2").innerHTML;
			_(".large-screen .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+'2" onclick="retirer(\''+idlettre+'\')"><span class="valeur">'+letter+'</span></span>'; 
		}
		else{
			let e = (document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre").length);
			
			var letterSpan = _(".large-screen #"+idlettre);
			var letter = _(".large-screen #"+idlettre+" .valeur .valeur2").innerHTML;
			_(".large-screen .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+''+e+'" onclick="retirer2(\''+idlettre+'\','+e+')"><span class="valeur">'+letter+'</span></span>'; 
		}
		
		var a = document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
	}

	function valider_proposition(){

		var a = document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
		//console.log(motP);
		if(mot_valide(motP) && !motsUtilises.includes(motP)){
			motsUtilises.push(motP);
			game.listeMots.push(motP);
			game.score+=calculer(motP);
			_(".large-screen .corps .entete .points .valeur").innerHTML = game.score;
			_(".large-screen .niveau-1.proposes .proposition").style.height = "0%";
			var divMot = create("div");
			var valeur = create("span");
			divMot.setAttribute("class", "mot");
			valeur.setAttribute("class", "valeur");
			valeur.innerHTML = motP;
			divMot.appendChild(valeur);
			_(".large-screen .proposes .mots").appendChild(divMot);
			retirerTout();
			motP = '';
			motsFormesSomme ++;
			_(".large-screen .proposes h2 .totalMotsFormes").innerHTML = motsFormesSomme;
			audios.game.play();

		}
		else{
			audios.game.play(1);

			if(motsUtilises.includes(motP)){
				_(".large-screen .niveau-1.proposes .proposition .erreur").innerHTML = 'Ce mot a déjà été utilisé.';
				_(".large-screen .niveau-1.proposes .proposition .erreur").style.opacity = 1;
				_(".large-screen .niveau-1.proposes .proposition .erreur").style.background = 'mediumvioletred';
			}
			else{
				_(".large-screen .niveau-1.proposes .proposition .erreur").innerHTML = "Ce mot n'existe pas dans mon dictionnaire.";
				_(".large-screen .niveau-1.proposes .proposition .erreur").style.background = '#F23F3F';
				_(".large-screen .niveau-1.proposes .proposition .erreur").style.opacity = 1;
			}
		}
		$('.large-screen .proposes .mots').animate({scrollTop : $('.large-screen .proposes .mots').prop('scrollHeight')}, 500);
	}

	function retirer(idlettre){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		_(".large-screen #"+idlettre+" .valeur").style.transform = "scale(1)";
		_(".large-screen #"+idlettre).setAttribute("onclick", "useLettre('"+idlettre+"')");
		let elt = _(".large-screen .lettre#"+idlettre+'2');
		//console.log(elt);
		_(".large-screen .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(".large-screen .niveau-1.proposes .proposition").style.height = "0%";
		}
		delete uses[uses.indexOf(idlettre)];
	}
	
	function retirer2(idlettre, nomb){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		let elt = _(".large-screen .lettre#"+idlettre+''+nomb);
		//console.log(elt);
		_(".large-screen .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(".large-screen .niveau-1.proposes .proposition").style.height = "0%";
		}
		delete uses[uses.indexOf(idlettre)];
	}

	function fact(m){
        if (m <= 1){
            return 1;
        }
        else {
            return (m*fact(m - 1));
        }
    }

	function arrang(a, b){
        return (fact(b)/fact(b-a));
    }

	function mots(mot){
	    let n = mot.length;
		
		let s = 0, j = 0, k = 0;
	    let ind = [];
	    let inds = [];
	    let words = [];
	    
		for (k = 1; k <= n; k++)
		{
			s += arrang(k, n);
		}
	    
	    for (let i = 0; i < mot.length; i++)
	    {
	        ind.push(i);
	        words.push(mot[i]);
	        inds.push([i]);
	    }
	    
	    let total = complete (ind, inds, words,mot, s);
	    return total;
		
	}

    function complete (ind, inds, words,mot,s)
    {

	    let min = 0;
	    let max = ind.length;
        for (let a = 0; a < s; a++)
        {
            let k = min;
            let l = max;
            min = max;
            for (let j = k; j < l; j++)
            {
                for (let i = 0; i < ind.length; i++)
                {
					if (!inds[j].includes(ind[i]))
					{
						let c = words[j] + mot[i];
						if(mot_valide(c)){
							words.push(c);
							inds.push(inds[j] + ind[i]);
							max++;
						}
                	}
                }
            }
        }
		//console.log("Nombre max de mots "+max);
		//console.log(mots);
        return mots;
    }

    function mot_valide(mot){
    	let dico = dicoAssocie(mot);
		if(dico.includes(mot)){
			return true;
		}
		else{
			return false;
		}
    }

	function retirerTout(){
		audios.close.play();
		let a = document.querySelectorAll(".large-screen .proposes .proposition .reste .mot .lettre");
		for(let i=0;i<a.length;i++){
			_(".large-screen .proposes .proposition .reste .mot").removeChild(a[i]);	
		}	
		a = document.querySelectorAll(".large-screen .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(".large-screen .page-jeu .niveau-2 .lettres .lettre .valeur");
		for(let i=0;i<a.length;i++){
			a[i].setAttribute("onclick", "useLettre('"+a[i].id+"')");
			b[i].style.transform = "scale(1)";
		}	
		_(".large-screen .page-jeu .niveau-1.proposes .proposition").style.height = "0%";
		uses = [];
	}


	function mot_valide(mot){
		let dico = dicoAssocie(mot);
		if(dico.includes(mot)){
		//	console.log("Ce dictionnaire contient le mot "+mot);
			return true;
		}
		else{
		//	console.log("Ce dictionnaire ne contient pas le mot "+mot);
			return false;
		}
	}

	function afficher_lettres(lettres){
		for(let i=0;i<lettres.length;i++){
			let lettre = lettres[i];
			let container = _(".large-screen .corps .lettres");
			let lettre_span = create("span");
			let valeur = create("span");
			let valeur2 = create("span");
			let score = create("sub");
			score.innerHTML = points[lettre.toUpperCase()];
			valeur.setAttribute("class", "valeur");
			valeur2.setAttribute("class", "valeur2");
			valeur2.innerHTML = lettre;
			lettre_span.id="lettre"+lettre+i;
			lettre_span.setAttribute("class", "lettre");
			lettre_span.setAttribute("onclick","useLettre('lettre"+lettre+i+"')");
			valeur.appendChild(valeur2);
			valeur.appendChild(score);
			lettre_span.appendChild(valeur);
			container.appendChild(lettre_span);
		}

	}


	function lancer_partie(){
		closeChat();
		//Lancer une partie
		$(".large-screen .page-jeu").fadeIn();
		$(".large-screen .page-jeu .regles").fadeIn();
		$(".large-screen .page-creation").fadeOut();
		$(".large-screen .page-partie").fadeOut();
		socket.emit("lancer partie", partie_en_cours);

	}

	socket.on("partie lancee", function (jeu){
		if(jeu.admin == partie_en_cours.admin){
			$(".large-screen .page-jeu").fadeIn();
			$(".large-screen .page-jeu .regles").fadeIn();
			$(".large-screen .page-creation").fadeOut();
			$(".large-screen .page-partie").fadeOut();
		}
	})

	function fermer_partie(){
		window.location.reload();
		//socket.emit("quitter partie");
	}

	function quitter(){
		window.location.reload();
	}
	
	function retirerPersonne(nom){
		if(confirm("Etes-vous sur de vouloir retirer "+nom+" ?")){
			socket.emit("retirer", nom);
		}
	}

	socket.on("retirer", function (nom){
		if(nom == user.pseudo){
			Bulle(partie_en_cours.admin+" vous a retiré de sa partie.");
			window.location.reload();
		}
	})

	socket.on("il quitte la partie", function (admin, nom){
		if(partie_en_cours){
			if(partie_en_cours.admin == admin){
				if(admin == nom){
					Bulle(nom+" a quitté votre partie.<br>Il y a changement d'admin");
				}
				else{
					Bulle(nom+" a quitté votre partie.");
				}
			}
		}
	})

	function Bulle(message){
		console.log(message);
	}

	function addPersonne(personne){
		var personnes= _(".large-screen .page-partie .niveau-2 .container-niveau-2");
		var cardPartie = create("div");
		if(partie_en_cours.admin == user.pseudo){
			var retirer = create("span");
			retirer.setAttribute("class","retirer");
			retirer.setAttribute("onclick","retirerPersonne('"+personne.pseudo+"')");
			retirer.innerHTML = 'Retirer'; 
			cardPartie.appendChild(retirer);
		}
		var nom = create("span");
		var niveau = create("span");
		cardPartie.setAttribute("class","personnal-card");
		nom.setAttribute("class","nom");
		niveau.setAttribute("class","niveau");
		niveau.innerHTML = 'Niveau '+personne.niveau; 
		nom.innerHTML = personne.pseudo; 


		cardPartie.appendChild(nom);
		cardPartie.appendChild(niveau);
		personnes.appendChild(cardPartie);

	}

	function addPartie(partie){
		if(!document.querySelector(".large-screen #"+partie.admin)){
			partie.date = new Date(partie.date);
			var jour = partie.date.getDate();
			var mois = partie.date.getMonth();
			var annee = partie.date.getFullYear();
			var heure = partie.date.getHours();
			var minute = partie.date.getMinutes();
			
			var cardPartie = create("div");
			var ligne1 = create("div");
			var ligne2 = create("div");
			var ligne3 = create("div");
			var ligne4 = create("div");
			var hr = create("hr");
			var joindre = create("button");
			var parties = document.querySelector(".large-screen .les-parties");

			cardPartie.setAttribute("class", "card-partie "+partie.admin);
			cardPartie.setAttribute("id",partie.admin);
			hr.setAttribute("class", "separateur-partie");
			ligne1.setAttribute("class", "ligne-1"); 
			ligne2.setAttribute("class", "ligne-2"); 
			ligne3.setAttribute("class", "ligne-3"); 
			ligne4.setAttribute("class", "ligne-4");
			joindre.setAttribute("class", "valid-btn join");
			joindre.setAttribute("onclick", "partie('"+partie.admin+"')");

			ligne1.innerHTML = 'Partie créée par <b>'+partie.admin+'</b>';
			ligne2.innerHTML = 'le '+((jour<10)?('0'+jour):jour)+'/'+((mois<10)?('0'+(mois+1)):(mois+1))+'/'+annee+' à '+((heure<10)?('0'+heure):heure)+':'+((minute<10)?('0'+minute):minute);
			ligne3.innerHTML = 'Nombre de participants : <b>'+partie.joueurs.length+'</b><br>Niveau Moyen : <b>'+partie.niveau+'</b><br><br>Sécurisé : <b>'+((partie.pass == "")?"Non":"Oui")+'</b>';
			joindre.innerHTML = 'REJOINDRE';

			ligne4.appendChild(joindre);
			cardPartie.appendChild(ligne1);
			cardPartie.appendChild(ligne2);
			cardPartie.appendChild(hr);
			cardPartie.appendChild(ligne3);
			cardPartie.appendChild(ligne4);
			parties.appendChild(cardPartie);
		}
	}

	function partie(admin){
		document.querySelector("body").onkeyup = ecrit;
		//socket.emit("open chat", admin);

		//Rejoindre la partie de admin
		//console.log("Vous avez demandé à rejoindre la partie de "+admin);
		_(".large-screen .create.valid-btn").removeAttribute("onclick");
		_(".large-screen .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		
		$(".large-screen .niveau-1.admin").fadeOut();		
		socket.emit("check password", admin);
		//socket.emit("joindre partie", admin);
	}

	socket.on("partie securisee", function(partie){
		_(".large-screen .second-screen").style.transform = 'scale(1)';
		_(".large-screen .second-screen .cadre").style.display = 'none';
		_(".large-screen .second-screen .password").style.display = 'flex';
		_(".large-screen .second-screen .password .valid").setAttribute("onclick", "validPass('"+partie.admin+"', '"+partie.pass+"')");
	})
	
	function validPass(admin, password){
		let pass = _(".large-screen .second-screen .password .pass").value;
		if(pass.toLowerCase() == password.toLowerCase()){
			_(".large-screen .second-screen").style.transform = 'scale(0)';
		    socket.emit("joindre partie", admin);
		}
		else{
			audios.erreur.play(1);
			_(".large-screen .second-screen .password .erreur").innerHTML = "Mot de passe erroné !";
			_(".large-screen .second-screen .password .pass").focus();
		}
	}

	function create(elt){
		return document.createElement(elt);
	}



}

else{
	tel = 1;
	var port = 5000;
	var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
	if(host.includes("localhost")){
		host+=":";
	}
	host+=port;
	var socket = io.connect("/");		
	var cookie_user = getCookie('user');
	var params = getParameters();
	var user = JSON.parse(cookie_user);
	var partie_en_cours;
	var game = {};
	var debut = new Date();
	var pause = 1, duree = 60*3, seconds=duree;
	var motP, motsUtilises = [];
	var motsFormesSomme = 0;
	var audios = {};
	var totalParties = 0;

	
	// Notification.requestPermission();
/*
	if(cookie_user == ""){
		//Premiere connexion
		window.location.href="index.html";
	}
*/
	if(document.location.href.includes("=")){
		adminInvite = document.location.href.split("=")[1];
		partie(adminInvite);
	}

	audios.clavier = {};
	audios.clavier.src = ["../Audios/clavier.wav"];
	audios.clavier.play = function (indice=0){
		_("audio.tonalite").src = this.src[0]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play();
	}

	audios.partie = {};
	audios.partie.src = ["../Audios/debut partie.mp3", "../Audios/nouvelle partie.wav"];
	audios.partie.play = function (indice=0){
	//	alert(indice);
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.player = {};
	audios.player.src = ["../Audios/player.mp3"];
	audios.player.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.erreur = {};
	audios.erreur.src = ["../Audios/erreur.mp3","../Audios/error.mp3","../Audios/error.ogg"];
	audios.erreur.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.gameOver = {};
	audios.gameOver.src = ["../Audios/game over.wav"];
	audios.gameOver.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.close = {};
	audios.close.src = ["../Audios/wind.mp3"];
	audios.close.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}

	audios.game = {};
	audios.game.src = ["../Audios/valid.mp3","../Audios/error.mp3"];
	audios.game.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}

	audios.temps = {};
	audios.temps.src = ["../Audios/temps.mp3"];
	audios.temps.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").play(); 
	}
	audios.temps.stop = function (){
		_("audio.tonalite").pause(); 
		_("audio.tonalite").currentTime = 0;
	}

	audios.melange = {};
	audios.melange.src = ["../Audios/melanger.mp3","../Audios/melanger2.mp3"];
	audios.melange.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").volume = 0.5;
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.start = {};
	audios.start.src = ["../Audios/start.mp3"];
	audios.start.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}

	audios.souris = {};
	audios.souris.src = ["../Audios/souris.mp3"];
	audios.souris.play = function (indice=0){
		_("audio.tonalite").src = this.src[indice]; 
		_("audio.tonalite").currentTime = 0;
		_("audio.tonalite").play(); 
	}


	socket.on("deconnexion", function(){
		deconnexion();
	})
	
	//Saisie clavier
	var	tapkey = 0;
	var uses = [];
	
	function share(){
		if(typeof(Website2APK) != "undefined"){
			Website2APK.shareIntent();
		}
		else{
			// console.log("Partager l'application");
			Navigator.share();
		}
	}

	function checkEvent( _event_ ){
		if ( window.event )
			return window.event;
		else
			return _event_;
	}
	function clavier(_event_){
		if(partie_en_cours.admin){
			if(partie_en_cours.etat == 1){
				let key = checkEvent(_event_).key, spans = document.querySelectorAll(".small-screen .lettres .lettre .valeur .valeur2"), elts= document.querySelectorAll(".small-screen .lettres .lettre"),letters = [], lettres = [], soluce = "";
				for(let i=0;i<spans.length;i++){
					letters[i] = {};
					letters[i].val = spans[i].innerHTML;
					lettres[i] = spans[i].innerHTML;
					letters[i].id = elts[i].id;
				}
				
				if(lettres.includes(key.toUpperCase()) && tapkey == 1){	
					if(partie_en_cours.parametres.pluralite == 'non'){
						for (let index = lettres.indexOf(key.toUpperCase());index >= 0; index = lettres.indexOf(key.toUpperCase(), index + 1)) {
							if(!uses.includes(letters[index].id)){
								useLettre(letters[index].id);
								uses.push(letters[index].id);
								break;
							}
						}
					}
					else{
						useLettre(letters[lettres.indexOf(key.toUpperCase())].id);
					}
				}
				
				if (checkEvent(_event_).keyCode == 13 && tapkey == 1){
					valider_proposition();
				}
				if (checkEvent(_event_).keyCode == 46 || checkEvent(_event_).keyCode == 8 && tapkey == 1){
					retirerTout();
				}
			}
			else{
				if (checkEvent(_event_).keyCode == 13 && tapkey == 1){
					sendMessageInParties();
				}
			}
		}
		
	}

	// function ouvrir(link){
	// 	document.location.href = "https://molux.eu-4.evennode.com/"+link;
	// }
	
	function ouvrirParametres(){
		_(".small-screen .second-screen").style.transform = 'scale(1)';
		_(".small-screen .second-screen .cadre").style.display = 'none';
		_(".small-screen .second-screen .parametres").style.display = 'flex';
	}

	function fermerParametres(){
		_(".small-screen .second-screen").style.transform = 'scale(0)';
	}


	socket.on('connect', function () {
		console.log("Connexion avec le serveur.");
		socket.emit("connexion json",user);
		document.querySelector("title").innerHTML = "MOLUX - "+user.pseudo;
		_(".small-screen .sidenav .pseudo").innerHTML = user.pseudo;
		_(".small-screen .sidenav .circle2").innerHTML = user.pseudo[0].toUpperCase();
		_(".small-screen .sidenav .tel").innerHTML = user.tel;
		if(typeof(Website2APK) == 'undefined'){
			console.log("pub");
		}
		else{
			/*setTimeout(function (){
				Website2APK.showInterstitialAd();
			}, 15000);
			*/
		}
		// _(".small-screen .sidenav .score").innerHTML = user.score;
		// _(".small-screen .sidenav .niveau").innerHTML = user.niveau;
	});

	socket.on("message", function (message){
		// console.log(message);
		M.toast({html: message});
		// new Notification("Molux", {"body":message,"dir":"auto","icon":"https://www.tchatat.fr/molux/favicon.ico"})

	})

	socket.on('disconnect', function () {
		M.toast({html: 'Déconnexion ...'});
		console.log("Déconnexion avec le serveur.");
	});

	socket.on("replace partie", function (name, part){
		if(partie_en_cours.admin == name){
			partie_en_cours = part;
			console.log("changement dadmin");
			//console.log(game);
			//console.log(part);
			game.admin = part.admin;
			M.toast({html: name+" a quitté votre partie. L'admin est désormais "+part.admin})
			socket.emit("replace partie", name, part);
		}
	});

	function accueil(){
		window.location.reload();
		if(typeof(Website2APK) != "undefined"){
			Website2APK.refreshPage();
		}
	}

	socket.on("non-lus", function (nombreMessages, username){
		if(username == user.pseudo){
			audios.partie.play(1);
			_(".small-screen .header-joueurs .niveau-2").innerHTML = '<span class="notification">'+nombreMessages+'</span>';
		}
	})

	socket.emit("unread");

	socket.on("unread", function (username, unreads){
		if(username == user.pseudo){
			let messagesNonLus = 0;
			for(name in unreads){
				messagesNonLus+=unreads[name].length;
			}
			
			if(messagesNonLus > 0){
				if(messagesNonLus == 1){
					_("title").innerHTML = user.pseudo + " ("+messagesNonLus+" message non lus) - MOLUX";
				}
				else{
					_("title").innerHTML = user.pseudo + " ("+messagesNonLus+" messages non lus) - MOLUX";
				}
				socket.emit("non-lus", messagesNonLus, user.pseudo);
			} 
		}
	})

	function fin(){
		console.log("la fin");
		//console.log(partie_en_cours);
		//console.log(game);
		$(".small-screen .page-jeu").fadeOut();
		$(".small-screen .page-fin-jeu").fadeIn();
		user.score+=game.score;
		user.parties++;
		user.niveau = parseInt(user.score/100) + 1;
		setCookie("user", JSON.stringify(user), 10);
		socket.emit("end game", game);
	}

	function sendMessageInParties(){
		let messageText = _(".small-screen .response-input").textContent;
		if(messageText.replace(/<br>/g,'').trim() != ""){
			let message = {};
			message = {
				sender: user.pseudo,
				date: new Date(),
				texte: verifyMessage(escapeHTML(messageText)),
				lus:[user.pseudo]
			}
			socket.emit("message des parties", message, partie_en_cours.admin);
		}
		scroll();
		_(".small-screen .response-input").focus();
		setTimeout(clean, 100);
	}

	function verifyMessage(texte){
		let t = " ";
		let textes = texte.split(" ");
		//console.log(textes);
		for(let i=0;i<textes.length;i++){
			let mot = textes[i];
			t+=URL(mot)+" ";
		//	console.log(t);
		}
		return t;
	}

	function URL(texte){
		let reg = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,}/;
		let regex = new RegExp(reg);

		if (texte.match(regex)) {
			let a;
			if(texte.includes("http")){
				a = '<a href="'+texte+'" target="_blank" class="message-link">';
			}
			else{
				a = '<a href="http://'+texte+'" target="_blank" class="message-link">';
			}
			a+=texte+"</a>";
			return a;		
		} else {
			return texte;
		}
	}
	function clean(){
		_(".small-screen .response-input").innerHTML = "";		
	}
	function escapeHTML(html) {
		return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
	}
	
	function copyToClipboard(obj)
	{
		M.toast({html: "Le lien de la partie a été copié dans le presse-paier.", classes:'rounded'})
		M.toast({html: "Le lien de la partie a été copié dans le presse-paier."})
		let elt = document.createElement("textarea");
		elt.value = obj;
		elt.id = "textarea-small";
		_(".small-screen").appendChild(elt);
		document.getElementById("textarea-small").select();
		document.execCommand("copy");
		if(navigator.share){

			navigator.share({
				title: 'Molux - Partie de '+user.pseudo,
				text: 'Rejoignez ma partie, je vous attend !',
				url: obj,
			});
		}
		else{
			M.toast({html: "Navigator.share ne fonctionne pas encore ici."})
			M.toast({html: "Navigator.share ne fonctionne pas encore ici.", classes:'rounded'})

		}
	}

	function invite(){
		let lien = "";
		for (let i=0; i < document.location.href.split("/").length - 1; i++){
			lien += document.location.href.split("/")[i] + "/";
		}
		lien += "=" + user.pseudo;
		copyToClipboard(lien);
	}
	
	
 	var MesmessagesNonLus = [];
	
	socket.on("message des parties", function(admin){
		if(partie_en_cours.admin){
			if(partie_en_cours.admin == admin){
				let messages = partie_en_cours.messages;
				//console.log(messages);
				let a = 0
				_(".small-screen .chat .contain").innerHTML = "";
				if(_(".small-screen .live-chat").style.display == "flex"){
					//Le chat est ouvert, donc il a tout lu
					for(let i=0;i<messages.length;i++){
						addMessage(messages[i]);
						socket.emit("message des parties lu", i, admin, user.pseudo);
					}
					scroll();
				}
				else{
					//On indique le nombre de messages non lus
					MesmessagesNonLus = [];
					for(let i=0;i<messages.length;i++){
						addMessage(messages[i]);
						if(!messages[i].lus.includes(user.pseudo))
						MesmessagesNonLus.push(i);
					}
				}
				if(MesmessagesNonLus.length <= 0){
					_(".small-screen .notif").style.display = "none";
					audios.game.play(0);
				}
				else{
					_(".small-screen .notif").innerHTML = MesmessagesNonLus.length;
					_(".small-screen .notif").style.display = "flex";
					audios.partie.play(0);				
				}
			}
		}	
	})

	var ecriture;

	if(typeof(Website2APK) != "undefined"){
		var verCode = Website2APK.getAppVersionCode();
		if(verCode < versionAPK){
			$('.modal.update').modal();
			$('.modal.update').modal('open');
		}
	}

	function updateAppli(){
		if(typeof(Website2APK) != "undefined"){
			Website2APK.openExternal("https://play.google.com/store/apps/details?id=com.tchatat.molux");
		}
	}

	function ecrit(_event_){
		let key = checkEvent(_event_);
		if (key.keyCode == 13){
			sendMessageInParties();
		}
		else{
			clearTimeout(ecriture);
			socket.emit("ecrit partie", partie_en_cours.admin);
			ecriture = setTimeout(function (){
				socket.emit("fin ecrit partie",  partie_en_cours.admin);
			}, 1000);
		}
	}

	socket.on("ecrit partie", function(nom_contact, admin){
		if(partie_en_cours.admin == admin && nom_contact != user.pseudo){
			if(!_(".small-screen .box-messages .entete .titre i"))
			_(".small-screen .box-messages .entete .titre ").innerHTML += "<i>"+nom_contact.split(" ")[0]+" écrit ...</i>";
		}
	});
	
	socket.on("fin ecrit partie", function(nom_contact, admin){
		if(partie_en_cours.admin == admin){
			if(_(".small-screen .box-messages .entete .titre i"))
				_(".small-screen .box-messages .entete .titre").removeChild(_(".small-screen .box-messages .entete .titre i"));
		}
	});

	function openChat(){
		_(".small-screen .live-chat").style.display = "flex";
		_(".small-screen .response-input").focus();
		for(let a=0;a<MesmessagesNonLus.length;a++){	
			socket.emit("message des parties lu", MesmessagesNonLus[a], partie_en_cours.admin, user.pseudo);
		}
		MesmessagesNonLus = [];		
		socket.emit("open chat", partie_en_cours.admin);
		scroll();
	}
	
	function closeChat(){
		_(".small-screen .live-chat").style.display = "none";
	}
	
	function scroll(){
		$('.small-screen .chat').animate({scrollTop : $('.small-screen .chat').prop('scrollHeight')}, 500);
		_(".small-screen .response-input").focus();
	}
	
	function addMessage(message){

		let bloc = create("div");
		let line = create("div");
		let a = create("a");
		let nom = create("span");
		let heure = create("span");
		let date = create("div");
		let messageDiv = create("div");
		let pDiv = create("p");

		if(user.pseudo == message.sender)
			bloc.setAttribute("class","bloc you");
		else
			bloc.setAttribute("class","bloc other");

		line.setAttribute("class", "line-1");
		a.setAttribute("class", "user");
		date.setAttribute("class", "date name");
		nom.setAttribute("class", "nom");
		heure.setAttribute("class", "heure");
		messageDiv.setAttribute("class", "message");
		a.href = "";

		a.innerHTML = message.sender[0].toUpperCase();
		pDiv.innerHTML = message.texte;
		nom.innerHTML = message.sender;
		heure.innerHTML = direDate(message.date);

		date.appendChild(nom);
		date.appendChild(heure);
		line.appendChild(a);
		line.appendChild(date);
		messageDiv.appendChild(pDiv);
		bloc.appendChild(line);
		bloc.appendChild(messageDiv);

		_(".small-screen .chat .contain").appendChild(bloc);
	}


	socket.on("end game", function (partie){
		if(partie.admin == partie_en_cours.admin){
			let rang = 1;
			let a = 0;
			let b = 0;

			partie.classement.forEach(function (user){
				addPersonneClassement(user, rang);
				rang++;
			})
			partie.motsTrouves.forEach(function (mot){
				addMotFin(mot, 'all');
				b++;
			})
			game.listeMots.forEach(function (mot){
				addMotFin(mot, 'self');
				a++;
			})
			
			_(".small-screen .mes-mots .total-mots").innerHTML = a;
			_(".small-screen .mots-restants .total-mots").innerHTML = b;
			partie_en_cours = {};

			_(".small-screen section.page-fin-jeu .corps .right .boutons .btn").setAttribute("onclick", "accueil()");
			let AllMots = mots(partie.lettres.join(""));
			//console.log(AllMots);
		}
		
	})

	function addPersonneClassement(personne, rangR){
		let userDiv = create("div");
		let rang = create("span");
		let nom = create("span");
		let total = create("span");
		userDiv.setAttribute("class", "user");
		total.setAttribute("class", "points");
		nom.setAttribute("class", "nom");
		rang.setAttribute("class", "num");
		nom.innerHTML = personne.user;
		total.innerHTML = personne.score+ " pts";
		rang.innerHTML = rangR+".";
		userDiv.appendChild(rang)
		userDiv.appendChild(nom)
		userDiv.appendChild(total)
		_(".small-screen .c-classement").appendChild(userDiv);
	}

	function addMotFin(mot, place){
		let motDiv = create("div");
		let valeurSpan = create("span");
		motDiv.setAttribute("class", "mot");
		valeurSpan.setAttribute("class", "valeur");
		valeurSpan.innerHTML = mot;
		motDiv.appendChild(valeurSpan);
		_(".small-screen .page-fin-jeu ."+place).appendChild(motDiv);
	}

	function creer_partie(){
		document.querySelector("body").onkeyup = ecrit;
		fermerParametres();
		_(".small-screen .create.valid-btn").removeAttribute("onclick");
		_(".small-screen .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		$(".small-screen .page-creation").fadeOut();
		$(".small-screen .page-partie").fadeIn();
		_(".small-screen .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
		_(".small-screen .chat .contain").innerHTML = "";
		$(".small-screen .niveau-1.admin").fadeIn();		
		//Création de partie
		var partie = {};
		partie.admin = user.pseudo;
		partie.date = new Date();
		partie.pass = _(".small-screen .second-screen .key").value;
		partie.parametres = {};
		partie.parametres.temps = _(".small-screen .second-screen .temps .val").innerHTML;
		partie.parametres.pluralite = _(".small-screen .second-screen .pluralite .val").innerHTML.toLowerCase();
		partie.parametres.mode = _(".small-screen .second-screen .mode .val").innerHTML.toLowerCase();
		partie.parametres.langue = _(".small-screen .second-screen .langue .val").innerHTML.toLowerCase();
		socket.emit("creer partie", partie);
	}


	function nombre_aleatoire(min, max) {
		let alea = Math.floor((max - min) * Math.random()) + min;
		return alea; // retourne un nombre
	  }
  
	function genererCle(){
		let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('').sort(function(){return 0.5-Math.random()}).join('');
		let chaine = "";
		do{
			chaine+=alphabet[nombre_aleatoire(0,alphabet.length)].toUpperCase();
		}while(chaine.length<8);
		chaine = chaine.split('').sort(function(){return 0.5-Math.random()}).join('');
		_(".small-screen .second-screen .key").value = chaine;
	}

	function changeTime(signe){
		let temps = parseInt(_(".small-screen .second-screen .temps .val").innerHTML);
		if(signe == '+'){
			if(temps >= 300){
				temps = 300;
			}
			else{
				temps+=30;
			}
		}
		else{
			if(temps <= 30){
				temps = 30;
			}
			else{
				temps-=30;
			}	
		}
		_(".small-screen .second-screen .temps .val").innerHTML = temps;
	}

	function changePluralite(){
		let mot =  _(".small-screen .second-screen .pluralite .val").innerHTML.toLowerCase();
		if(mot == 'oui'){
			_(".small-screen .second-screen .pluralite .val").innerHTML = "Non";
		}
		else{
			_(".small-screen .second-screen .pluralite .val").innerHTML = "Oui";
		}
	}

	function changeMode(){
		let mot =  _(".small-screen .second-screen .mode .val").innerHTML.toLowerCase();
		/*
		if(mot == 'classique'){
			_(".small-screen .second-screen .mode .val").innerHTML = "Tournoi";
		}
		else{
		}
		*/
		_(".small-screen .second-screen .mode .val").innerHTML = "Classique";
	}
	
	function changeLangue(){
		let mot =  _(".small-screen .second-screen .langue .val").innerHTML.toLowerCase();
		if(mot == 'francais'){
			_(".small-screen .second-screen .langue .val").innerHTML = "Anglais";
		}
		else{
			_(".small-screen .second-screen .langue .val").innerHTML = "Francais";
		}
	}


	socket.on("deconnexion", function(){
		document.location.href="parties";
		window.location.reload();
		if(typeof(Website2APK) != "undefined"){
			Website2APK.refreshPage();
		}
	})

	function deconnexionVerif(){
		$('.modal.deconnexion').modal();
		$('.modal.deconnexion').modal('open');
	}
	
	socket.on("utilisateur connecte", function (joueurs){
		let a=0;
		document.querySelector(".small-screen .joueurs .les-joueurs").innerHTML = '';		
		_(".small-screen .joueurs .aucune-partie").style.display = 'none';
		for(var nom in joueurs){
			addJoueur(joueurs[nom]);
			a++;
		}
	
		//new Notification("Molux - Nouvel utilisateur", {"body":a+" utilisateur(s) connecté(s).","dir":"auto","icon":"https://www.tchatat.fr/molux/favicon.ico"})
//		if(a>0)
//			_(".joueur-tab a").innerHTML = "JOUEURS ("+a+")";
		
	})

	socket.on("parties", function (parties){
		let a = 0; // a > 0 signiife qu'il y'a plusieurs parties en cours
		let b = 0; // b = 1 signifie que le joueur a une partie en cours
		document.querySelector(".small-screen .enattente .les-parties").innerHTML = '';	
		document.querySelector(".small-screen .encours .les-parties").innerHTML = '';	
		for(var admin in parties){
			if(parties[admin].admin != user.pseudo){
				if(parties[admin].etat == 0){
					_(".small-screen .enattente .aucune-partie").style.display = 'none';
					//etat = 0 signifie la partie est encore disponible
					addPartie(parties[admin]);
					a++;
				}
				else{
					_(".small-screen .encours .aucune-partie").style.display = 'none';
					addPartieEnCours(parties[admin]);
				}
			}
			if(parties[admin].listeJoueurs.includes(user.pseudo)){
				partie_en_cours = parties[admin];
				b = 1;
				a++;
			}
		}
		if(a > totalParties){
			totalParties = a;
			audios.partie.play(1);
		}
		if(a == 0){
			_(".small-screen .page-creation .aucune-partie").style.display = 'inline-block';
			_(".small-screen .enattente .aucune-partie").style.display = 'inline-block';
			document.querySelector(".small-screen .page-creation .les-parties").innerHTML = '';	
			if(_(".small-screen .enattente-tab .active")){
				$(".small-screen .page-creation").fadeIn();
				$(".small-screen .page-partie").fadeOut();
			}
		}
		if(b == 0){
			_(".small-screen .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
			_(".small-screen .create.valid-btn").innerHTML = '<i class="material-icons">add</i>';
			partie_en_cours = {};
		}
		user.etat = b;
	});
		
	socket.on("partie rejoint", function (partie){
		if(partie.listeJoueurs.includes(user.pseudo)){
			$(".small-screen .page-creation").fadeOut();
			$(".small-screen .page-partie").fadeIn();
			_(".small-screen .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
			_(".small-screen .commencer").innerHTML = "COMMENCER";

			partie_en_cours = partie;
			//console.log(partie_en_cours);
			for(var i=0;i<partie.joueurs.length;i++){
				/*if(partie.joueurs[i].pseudo == user.pseudo){
					let p = partie.joueurs[i];
					p.pseudo = "Vous";
					p.pseudo = "Vous";
					addPersonne(p);
				}
				else{
					console.log("Ajout de "+partie.joueurs[i].pseudo);
				}*/
				addPersonne(partie.joueurs[i]);
			}
			//_(".live-chat").style.display = "none";
			socket.emit("open chat", partie_en_cours.admin);
		}
	})

	socket.on("fermer partie", function (partie, utilisateur){
		window.location.reload();
		if(typeof(Website2APK) != "undefined"){
			Website2APK.refreshPage();
		}
		partie_en_cours = partie;
		user = utilisateur;
		$(".small-screen .page-creation").fadeIn();
		$(".small-screen .page-partie").fadeOut();
		_(".small-screen .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
		_(".small-screen .create.valid-btn").innerHTML = 'Créer une partie';
	})

	socket.on("suppression partie", function (admin){
		if(partie_en_cours.admin){
			if(partie_en_cours.admin == admin){		
				fermer_partie();
				//user.etat = 0;
				//socket.emit("update user", user);
			}
		}
	})

	socket.on("partie prete", function (part){
		if(partie_en_cours.admin == part.admin){
			partie_en_cours = part;
			let elt = _(".small-screen .commencer.inactive");
			elt.removeAttribute("class");
			elt.setAttribute("class", "commencer active");
			elt.setAttribute("onclick", "ready()");
			audios.start.play();
		}
	})

	function ready(){

		let elt = _(".small-screen .commencer.active");
		elt.removeAttribute("class");
		elt.setAttribute("class", "commencer inactive");
		_(".small-screen button.commencer").removeAttribute("onclick");
		_(".small-screen button.commencer").innerHTML ='<img class="loader" src="Images/eclipse-loader.svg"/>';
		socket.emit("ready");
	}

	socket.on("partie en cours", function (partie){
		if(partie_en_cours.admin == partie.admin)
			partie_en_cours = partie;
	})

	socket.on("lancement de la partie", function (partie){
		// alert("partie_en_cours = partie de "+partie_en_cours.admin);
		// alert("Lancement de la partie de "+ partie.admin);
		if(partie_en_cours.admin == partie.admin){
			$(".small-screen .regles").fadeOut();
			partie_en_cours = partie;
			game.username = user.pseudo;
			game.admin = partie_en_cours.admin;
			game.listeMots = [];
			game.score = 0;
			socket.emit("occupe");
			init();
		}
	})



	function init(){
		document.querySelector("body").onkeyup = clavier;

		audios.partie.play(0);
		//_(".small-screen .corps .min-possibilites .valeur").innerHTML = partie_en_cours.lettres.length;
		afficher_lettres(partie_en_cours.lettres);
		pause = 0;
		tapkey = 1;
		lang = partie_en_cours.parametres.langue;
		compteur(partie_en_cours.parametres.temps,".small-screen .header .temps .valeur");
	}

	function mix(){
		retirerTout();
		let z = document.querySelector(".small-screen .page-jeu .niveau-2 .lettres");
		let a = document.querySelectorAll(".small-screen .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(".small-screen .page-jeu .niveau-2 .lettres .lettre .valeur");
		for(let i=0;i<a.length;i++){
			z.removeChild(a[i]);
		}
		a = melange(a);// Melange est dans le fichier script.js
		for(let i=0;i<a.length;i++){
			z.appendChild(a[i]);
		}
	}
	    
	function melange(elt){ 
		audios.melange.play(1); 
	    let longueur = elt.length, i = 0, nouveau = new Array();
	    nombre = parseInt((Math.random().toFixed(1) * longueur));
	    while(elt[i]){
	        while(nouveau[nombre] || nombre < 0|| nombre > longueur-1){
	            nombre = parseInt((Math.random().toFixed(1) * longueur));
	        }
	       // console.log("Nombre:"+nombre);
	       // console.log(nouveau);
	        nouveau[nombre] = elt[i];
	        i++;
	    }
	    return nouveau;
	}

	
	function useLettre(idlettre){
		audios.clavier.play();
		_(".small-screen .niveau-1.proposes .proposition").style.height = "100%";
		_(".small-screen .niveau-1.proposes .proposition .erreur").style.opacity="0";
		if(partie_en_cours.parametres.pluralite == 'non'){
			_(".small-screen #"+idlettre+" .valeur").style.transform = "scale(0)";
			_(".small-screen #"+idlettre).removeAttribute("onclick");
			var letterSpan = _(".small-screen #"+idlettre);
			var letter = _(".small-screen #"+idlettre+" .valeur .valeur2").innerHTML;
			_(".small-screen .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+'2" onclick="retirer(\''+idlettre+'\')"><span class="valeur">'+letter+'</span></span>'; 
		}
		else{
			let e = (document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre").length);
			
			var letterSpan = _(".small-screen #"+idlettre);
			var letter = _(".small-screen #"+idlettre+" .valeur .valeur2").innerHTML;
			_(".small-screen .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+''+e+'" onclick="retirer2(\''+idlettre+'\','+e+')"><span class="valeur">'+letter+'</span></span>'; 
		}
		
		var a = document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
	}

	function valider_proposition(){

		var a = document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
		//console.log(motP);
		if(mot_valide(motP) && !motsUtilises.includes(motP)){
			motsUtilises.push(motP);
			game.listeMots.push(motP);
			game.score+=calculer(motP);
			_(".small-screen .corps .entete .points .valeur").innerHTML = game.score;
			_(".small-screen .niveau-1.proposes .proposition").style.height = "0%";
			var divMot = create("div");
			var valeur = create("span");
			divMot.setAttribute("class", "mot");
			valeur.setAttribute("class", "valeur");
			valeur.innerHTML = motP;
			divMot.appendChild(valeur);
			_(".small-screen .proposes .mots").appendChild(divMot);
			retirerTout();
			motP = '';
			motsFormesSomme ++;
			_(".small-screen .proposes h2 .totalMotsFormes").innerHTML = motsFormesSomme;
			audios.game.play();

		}
		else{
			audios.game.play(1);

			if(motsUtilises.includes(motP)){
				_(".small-screen .niveau-1.proposes .proposition .erreur").innerHTML = 'Ce mot a déjà été utilisé.';
				_(".small-screen .niveau-1.proposes .proposition .erreur").style.opacity = 1;
				_(".small-screen .niveau-1.proposes .proposition .erreur").style.background = 'mediumvioletred';
			}
			else{
				_(".small-screen .niveau-1.proposes .proposition .erreur").innerHTML = "Ce mot n'existe pas dans mon dictionnaire.";
				_(".small-screen .niveau-1.proposes .proposition .erreur").style.background = '#F23F3F';
				_(".small-screen .niveau-1.proposes .proposition .erreur").style.opacity = 1;
			}
		}
		$('.small-screen .proposes .mots').animate({scrollTop : $('.small-screen .proposes .mots').prop('scrollHeight')}, 500);
	}

	function retirer(idlettre){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		_(".small-screen #"+idlettre+" .valeur").style.transform = "scale(1)";
		_(".small-screen #"+idlettre).setAttribute("onclick", "useLettre('"+idlettre+"')");
		let elt = _(".small-screen .lettre#"+idlettre+'2');
		//console.log(elt);
		_(".small-screen .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(".small-screen .niveau-1.proposes .proposition").style.height = "0%";
		}
		delete uses[uses.indexOf(idlettre)];
	}
	
	function retirer2(idlettre, nomb){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		let elt = _(".small-screen .lettre#"+idlettre+''+nomb);
		//console.log(elt);
		_(".small-screen .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(".small-screen .niveau-1.proposes .proposition").style.height = "0%";
		}
		delete uses[uses.indexOf(idlettre)];
	}

	function fact(m){
        if (m <= 1){
            return 1;
        }
        else {
            return (m*fact(m - 1));
        }
    }

	function arrang(a, b){
        return (fact(b)/fact(b-a));
    }

	function mots(mot){
	    let n = mot.length;
		
		let s = 0, j = 0, k = 0;
	    let ind = [];
	    let inds = [];
	    let words = [];
	    
		for (k = 1; k <= n; k++)
		{
			s += arrang(k, n);
		}
	    
	    for (let i = 0; i < mot.length; i++)
	    {
	        ind.push(i);
	        words.push(mot[i]);
	        inds.push([i]);
	    }
	    
	    let total = complete (ind, inds, words,mot, s);
	    return total;
		
	}

    function complete (ind, inds, words,mot,s)
    {

	    let min = 0;
	    let max = ind.length;
        for (let a = 0; a < s; a++)
        {
            let k = min;
            let l = max;
            min = max;
            for (let j = k; j < l; j++)
            {
                for (let i = 0; i < ind.length; i++)
                {
					if (!inds[j].includes(ind[i]))
					{
						let c = words[j] + mot[i];
						if(mot_valide(c)){
							words.push(c);
							inds.push(inds[j] + ind[i]);
							max++;
						}
                	}
                }
            }
        }
		console.log("Nombre max de mots "+max);
		//console.log(mots);
        return mots;
    }

    function mot_valide(mot){
    	let dico = dicoAssocie(mot);
		if(dico.includes(mot)){
			return true;
		}
		else{
			return false;
		}
    }

	function retirerTout(){
		audios.close.play();
		let a = document.querySelectorAll(".small-screen .proposes .proposition .reste .mot .lettre");
		for(let i=0;i<a.length;i++){
			_(".small-screen .proposes .proposition .reste .mot").removeChild(a[i]);	
		}	
		a = document.querySelectorAll(".small-screen .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(".small-screen .page-jeu .niveau-2 .lettres .lettre .valeur");
		for(let i=0;i<a.length;i++){
			a[i].setAttribute("onclick", "useLettre('"+a[i].id+"')");
			b[i].style.transform = "scale(1)";
		}	
		_(".small-screen .page-jeu .niveau-1.proposes .proposition").style.height = "0%";
		uses = [];
	}


	function mot_valide(mot){
		let dico = dicoAssocie(mot);
		if(dico.includes(mot)){
			console.log("Ce dictionnaire contient le mot "+mot);
			return true;
		}
		else{
			console.log("Ce dictionnaire ne contient pas le mot "+mot);
			return false;
		}
	}



	function afficher_lettres(lettres){
		for(let i=0;i<lettres.length;i++){
			let lettre = lettres[i];
			let container = _(".small-screen .corps .lettres");
			let lettre_span = create("span");
			let valeur = create("span");
			let valeur2 = create("span");
			let score = create("sub");
			score.innerHTML = points[lettre.toUpperCase()];
			valeur.setAttribute("class", "valeur");
			valeur2.setAttribute("class", "valeur2");
			valeur2.innerHTML = lettre;
			lettre_span.id="lettre"+lettre+i;
			lettre_span.setAttribute("class", "lettre");
			lettre_span.setAttribute("onclick","useLettre('lettre"+lettre+i+"')");
			valeur.appendChild(valeur2);
			valeur.appendChild(score);
			lettre_span.appendChild(valeur);
			container.appendChild(lettre_span);
		}
	}


	function lancer_partie(){
		closeChat();
		//Lancer une partie
		$(".small-screen .page-jeu").fadeIn();
		$(".small-screen .page-jeu .regles").fadeIn();
		$(".small-screen .page-creation").fadeOut();
		$(".small-screen .page-partie").fadeOut();
		socket.emit("lancer partie", partie_en_cours);

	}

	socket.on("partie lancee", function (jeu){
		if(jeu.admin == partie_en_cours.admin){
			$(".small-screen .page-jeu").fadeIn();
			$(".small-screen .page-jeu .regles").fadeIn();
			$(".small-screen .page-creation").fadeOut();
			$(".small-screen .page-partie").fadeOut();
		}
	})

	function fermer_partie(){
		window.location.reload();
		if(typeof(Website2APK) != "undefined"){
			Website2APK.refreshPage();
		}
		//socket.emit("quitter partie");
	}

	function quitter(){
		window.location.reload();
		if(typeof(Website2APK) != "undefined"){
			Website2APK.refreshPage();
		}
	}
	
	function retirerPersonne(nom){
		if(confirm("Etes-vous sur de vouloir retirer "+nom+" ?")){
			socket.emit("retirer", nom);
		}
	}

	socket.on("retirer", function (nom){
		if(nom == user.pseudo){
			// alert(partie_en_cours.admin+" vous a retiré de sa partie.");
			M.toast({html: partie_en_cours.admin+" vous a retiré de sa partie."});
			setTimeout(function (){
				document.location.href = "./index";
			}, 3000);
		}
	})

	function addPersonne(personne){
		var personnes= _(".small-screen .page-partie .niveau-2 .container-niveau-2");
		var cardPartie = create("div");
		if(partie_en_cours.admin == user.pseudo){
			var retirer = create("span");
			retirer.setAttribute("class","retirer");
			retirer.setAttribute("onclick","retirerPersonne('"+personne.pseudo+"')");
			retirer.innerHTML = 'Retirer'; 
			cardPartie.appendChild(retirer);
		}
		var nom = create("span");
		var niveau = create("span");
		cardPartie.setAttribute("class","personnal-card");
		nom.setAttribute("class","nom");
		niveau.setAttribute("class","niveau");
		niveau.innerHTML = 'Niveau '+personne.niveau; 
		nom.innerHTML = personne.pseudo; 


		cardPartie.appendChild(nom);
		cardPartie.appendChild(niveau);
		personnes.appendChild(cardPartie);

	}

	function addPartie(partie){
		if(!document.querySelector(".small-screen .page-creation #"+partie.admin)){
			partie.date = new Date(partie.date);
			var jour = partie.date.getDate();
			var mois = partie.date.getMonth();
			var annee = partie.date.getFullYear();
			var heure = partie.date.getHours();
			var minute = partie.date.getMinutes();
			
			var cardPartie = create("div");
			var ligne1 = create("div");
			var ligne2 = create("div");
			var ligne3 = create("div");
			var ligne4 = create("div");
			var hr = create("hr");
			var joindre = create("button");
			var parties = document.querySelector(".small-screen .enattente .les-parties");

			cardPartie.setAttribute("class", "card-partie "+partie.admin);
			cardPartie.setAttribute("id",partie.admin);
			hr.setAttribute("class", "separateur-partie");
			ligne1.setAttribute("class", "ligne-1"); 
			ligne2.setAttribute("class", "ligne-2"); 
			ligne3.setAttribute("class", "ligne-3"); 
			ligne4.setAttribute("class", "ligne-4");
			joindre.setAttribute("class", "valid-btn join");
			joindre.setAttribute("onclick", "partie('"+partie.admin+"')");

			ligne1.innerHTML = 'Partie créée par <b>'+partie.admin+'</b>';
			ligne2.innerHTML = 'le '+((jour<10)?('0'+jour):jour)+'/'+((mois<10)?('0'+(mois+1)):(mois+1))+'/'+annee+' à '+((heure<10)?('0'+heure):heure)+':'+((minute<10)?('0'+minute):minute);
			ligne3.innerHTML = 'Nombre de participants : <b>'+partie.joueurs.length+'</b><br>Niveau Moyen : <b>'+partie.niveau+'</b><br>Partie sécurisée : <b>'+((partie.pass == "")?"Non":"Oui")+'</b>';
			joindre.innerHTML = 'REJOINDRE';

			ligne4.appendChild(joindre);
			cardPartie.appendChild(ligne1);
			cardPartie.appendChild(ligne2);
			cardPartie.appendChild(hr);
			cardPartie.appendChild(ligne3);
			cardPartie.appendChild(ligne4);
			parties.appendChild(cardPartie);
		}
		else{
			console.log("else "+partie.admin);
		}
	}
	
	function addPartieEnCours(partie){
		if(!document.querySelector(".small-screen .page-visionnage #"+partie.admin)){
			partie.date = new Date(partie.date);
			var jour = partie.date.getDate();
			var mois = partie.date.getMonth();
			var annee = partie.date.getFullYear();
			var heure = partie.date.getHours();
			var minute = partie.date.getMinutes();
			
			var cardPartie = create("div");
			var ligne1 = create("div");
			var ligne2 = create("div");
			var ligne3 = create("div");
			var ligne4 = create("div");
			var hr = create("hr");
			var parties = document.querySelector(".small-screen .encours .les-parties");

			cardPartie.setAttribute("class", "card-partie "+partie.admin);
			cardPartie.setAttribute("id",partie.admin);
			hr.setAttribute("class", "separateur-partie");
			ligne1.setAttribute("class", "ligne-1"); 
			ligne2.setAttribute("class", "ligne-2"); 
			ligne3.setAttribute("class", "ligne-3"); 
			ligne4.setAttribute("class", "ligne-4");

			ligne1.innerHTML = 'Partie créée par <b>'+partie.admin+'</b>';
			ligne2.innerHTML = 'le '+((jour<10)?('0'+jour):jour)+'/'+((mois<10)?('0'+(mois+1)):(mois+1))+'/'+annee+' à '+((heure<10)?('0'+heure):heure)+':'+((minute<10)?('0'+minute):minute);
			ligne3.innerHTML = 'Nombre de participants : <b>'+partie.joueurs.length+'</b><br>Niveau Moyen : <b>'+partie.niveau+'</b><br>Partie sécurisée : <b>'+((partie.pass == "")?"Non":"Oui")+'</b>';

			cardPartie.appendChild(ligne1);
			cardPartie.appendChild(ligne2);
			cardPartie.appendChild(hr);
			cardPartie.appendChild(ligne3);
			cardPartie.appendChild(ligne4);
			parties.appendChild(cardPartie);
		}
		else{
			console.log("else "+partie.admin);
		}
	}

	function addJoueur(joueur){
		if(joueur.pseudo != user.pseudo){

			if(!document.querySelector(".small-screen #joueur-"+joueur.pseudo)){
				
				var cardPartie = create("div");
				var ligne1 = create("div");
				var ligne2 = create("div");
				var joueurs = document.querySelector(".small-screen .les-joueurs");
				
				cardPartie.setAttribute("class", "card-partie "+joueur.pseudo);
				if(joueur.etat != 2){
					cardPartie.setAttribute("onclick", "appeler('"+joueur.pseudo+"')");
				}
				cardPartie.setAttribute("id","joueur-"+joueur.pseudo);
				ligne1.setAttribute("class", "ligne-1"); 
				ligne2.setAttribute("class", "ligne-2"); 
				ligne1.innerHTML = ' <b>'+joueur.pseudo+((joueur.etat == 2)?'(occupé)':"")+'</b>';
				ligne2.innerHTML = 'Niveau '+joueur.niveau;
				
				cardPartie.appendChild(ligne1);
				cardPartie.appendChild(ligne2);
				joueurs.appendChild(cardPartie);
			}
		}
	}
		
	function appeler(nom){
		_(".modal.appeler .modal-content h4").innerHTML = "Appel de "+nom;
		_(".modal.appeler .modal-footer .yes").setAttribute("onclick", "lancerAppel('"+nom+"')");
		$('.modal.appeler').modal();
		$('.modal.appeler').modal('open');
	}

	function lancerAppel(nom){
		let mess = $("#message-appel").val();
		socket.emit("appel", nom, mess);
	}

	var dejaJoue = 0;
 
	_("body").onclick = function (){
		if(dejaJoue != 1){
			dejaJoue = 1;
			_("audio.sonnerie").play();
			_("audio.sonnerie").pause();			
		}
	}
	socket.on("recevoir appel", function (name, appelant, message){
		if(name == user.pseudo){
			_("audio.sonnerie").currentTime = 0;			
			_("audio.sonnerie").play();			
			window.navigator.vibrate([1000,300,1000,300,1000,300,2000,300]);
			M.toast({html: appelant+" vous invite à jouer une partie avec lui."});
			_(".modal.recevoir .modal-content p").innerHTML = "Appel de "+appelant+"<br>Message : "+message;
			
			$('.modal.recevoir').modal();
			$('.modal.recevoir').modal('open');			
		}
	})

	M.Modal.init($('.modal.recevoir'),{
		onCloseEnd: onModalClose 
	});
	function onModalClose(){
		_("audio.sonnerie").pause()
	}
	function appelRecu(){
		window.navigator.vibrate(0);
		_("audio.sonnerie").pause();			
		_("audio.sonnerie").currentTime = 0;			
	}

	$(document).ready(function(){
		
	})


	function tab(elt){
		//$("section").fadeOut();
		$("."+elt).fadeIn();
	}

	function partie(admin){
		document.querySelector("body").onkeyup = ecrit;
		//socket.emit("open chat", admin);

		//Rejoindre la partie de admin
		console.log("Vous avez demandé à rejoindre la partie de "+admin);
		_(".small-screen .create.valid-btn").removeAttribute("onclick");
		_(".small-screen .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		
		$(".small-screen .niveau-1.admin").fadeOut();		
		socket.emit("check password", admin);
		//socket.emit("joindre partie", admin);
	}

	socket.on("partie securisee", function(partie){
		_(".small-screen .second-screen").style.transform = 'scale(1)';
		_(".small-screen .second-screen .cadre").style.display = 'none';
		_(".small-screen .second-screen .password").style.display = 'flex';
		_(".small-screen .second-screen .password .valid").setAttribute("onclick", "validPass('"+partie.admin+"', '"+partie.pass+"')");
	})
	
	function validPass(admin, password){
		let pass = _(".small-screen .second-screen .password .pass").value;
		if(pass.toLowerCase() == password.toLowerCase()){
			_(".small-screen .second-screen").style.transform = 'scale(0)';
		    socket.emit("joindre partie", admin);
		}
		else{
			audios.erreur.play(1);
			_(".small-screen .second-screen .password .erreur").innerHTML = "Mot de passe erroné !";
			_(".small-screen .second-screen .password .pass").focus();
		}
	}

	function create(elt){
		return document.createElement(elt);
	}



	document.addEventListener('DOMContentLoaded', function() {
	    var elems = document.querySelectorAll('.small-screen .sidenav');
	    var instances = M.Sidenav.init(elems);
	  });
	// var instance = M.Tabs.init(el);

}

function direDate(date){
	date = new Date(date);
	let jourA = date.getDate();
	let moisA = date.getMonth();
	let anneeA = date.getFullYear();
	let heureA = date.getHours();
	let minuteA = date.getMinutes();
	
	let today = new Date();

	let jourB = today.getDate();
	let moisB = today.getMonth();
	let anneeB = today.getFullYear();
	let heureB = today.getHours();
	let minuteB = today.getMinutes();

	let chaine = "";

	if(anneeA==anneeB){
		if(moisA==moisB){
			if(jourA==jourB){
				if(heureA==heureB){
					if(minuteA==minuteB){
						chaine = "A l'instant";
					}
					else{
						chaine = "Il y'a " + (minuteB-minuteA) + " min";
					}
				}
				else{
					if( ((heureB-heureA) == 1) && (minuteB < minuteA))
						chaine = "Il y'a " + (60-minuteA+minuteB) + " min";
					else
						chaine = "Il y'a " + (heureB-heureA) + " heure(s)";
				}
			}
			else{
				if((jourB-jourA) == 1)
					chaine = "Envoyé hier";
				else
					chaine = "Il y'a " + (jourB-jourA) + " jours";
			}
		}
		else{
			chaine = "Il y'a " + (moisB-moisA) + " mois";
			//chaine = "Envoyé le "+jourA+"/"+moisA+"/"+anneeA+" à "+heureA+":"+minuteA;
		}
	}
	else{
		if((anneeB-anneeA)==1){
			chaine = "Il y'a un an";
		}
		else{
			chaine = "Il y'a " + (anneeB-anneeA) + " ans";
		}
		//chaine = "Envoyé le "+jourA+"/"+moisA+"/"+anneeA+" à "+heureA+":"+minuteA;
	}

	return chaine;
}

function dicoAssocie(mot){
	let lang = "francais";
	if(partie_en_cours)
		lang = partie_en_cours.parametres.langue;
	let dico = [];
	switch(mot[0]){
		case "B":
			dico = BDICO[lang].split(',');
			break;
		case "C":
			dico = CDICO[lang].split(',');
			break;
		case "D":
			dico = DDICO[lang].split(',');
			break;
		case "F":
			dico = FDICO[lang].split(',');
			break;
		case "G":
			dico = GDICO[lang].split(',');
			break;
		case "H":
			dico = HDICO[lang].split(',');
			break;
		case "J":
			dico = JDICO[lang].split(',');
			break;
		case "K":
			dico = KDICO[lang].split(',');
			break;
		case "L":
			dico = LDICO[lang].split(',');
			break;
		case "M":
			dico = MDICO[lang].split(',');
			break;
		case "N":
			dico = NDICO[lang].split(',');
			break;
		case "P":
			dico = PDICO[lang].split(',');
			break;
		case "Q":
			dico = QDICO[lang].split(',');
			break;
		case "R":
			dico = RDICO[lang].split(',');
			break;
		case "S":
			dico = SDICO[lang].split(',');
			break;
		case "T":
			dico = TDICO[lang].split(',');
			break;
		case "V":
			dico = VDICO[lang].split(',');
			break;
		case "W":
			dico = WDICO[lang].split(',');
			break;
		case "X":
			dico = XDICO[lang].split(',');
			break;
		case "Y":
			dico = YDICO[lang].split(',');
			break;
		case "Z":
			dico = ZDICO[lang].split(',');
			break;
		case "A":
			dico = ADICO[lang].split(',');
			break;
		case "E":
			dico = EDICO[lang].split(',');
			break;
		case "O":
			dico = ODICO[lang].split(',');
			break;
		case "I":
			dico = IDICO[lang].split(',');
			break;
		case "U":
			dico = UDICO[lang].split(',');
			break;
		default:
			//alert("Erreur dictionnaire");
			break;
	}
	return dico;
}


function compteur(temps, elt, limit = 0){ 
	if(!temps)
		temps = 0;
	if(pause == 0){
		seconds = temps;
		temps--;
	}
	second(seconds, elt);
//	(pas > reponses.length)?document.querySelector(elt).innerHTML = 0: setTimeout(compteur, 905, temps);		
	if (seconds <= 0){
	//	alert("Le temps est arrivé a 0");
		audios.temps.stop();
		audios.gameOver.play();
		if(typeof(Website2APK) == 'undefined'){
		//	console.log("pub");
		}
		else{
			Website2APK.showInterstitialAd();
		}
		fin();
		//pas = reponses.length +5 ;
	}
	else if(seconds < 6){
		if(limit == 0){
			limit = 1;
			audios.temps.play();
		}
		setTimeout(compteur, 980, temps, elt,limit);
	}
	else{
		setTimeout(compteur, 980, temps, elt,limit);
	}
}

function second(a,elt){
	b = parseInt(a/60);
	if(b == 0)
		document.querySelector(elt).innerHTML = a;
	else{
		a = a - (b * 60); 
		if( a < 10)
			document.querySelector(elt).innerHTML = b + "'0"+a;
		else
			document.querySelector(elt).innerHTML = b + "'"+a;
	}
}

function signal_bug(){
	socket.emit("bug");
	let src="https://www.tchatat.fr/mail/post_bug.php?data="+JSON.stringify(user)
	_("iframe").setAttribute("src",src);
}

//M.AutoInit();


$(document).ready(function(){
	$(".chargement-accueil").fadeOut();
	$('.small-screen .tabs').tabs({swipeable: true});
	$('.small-screen .tap-target').tapTarget();
    $('.small-screen .tooltipped').tooltip();
	$('.small-screen .tap-target').tapTarget('open');
	$(".small-screen section.enattente").fadeIn();
	$(".small-screen section.encours").fadeIn();
	$(".small-screen section.joueurs").fadeIn();
	setTimeout(function (){
		$('.small-screen .tap-target').tapTarget('close');
	}, 6000)
});
		