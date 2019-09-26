var versionAPK=3;

var points = {
	"A":1,
	"B":3,
	"C":4,
	"D":1,
	"E":1,
	"F":4,
	"G":3,
	"H":3,
	"I":1,
	"J":6,
	"K":5,
	"L":1,
	"M":3,
	"N":1,
	"O":2,
	"P":2,
	"Q":7,
	"R":2,
	"S":1,
	"T":1,
	"U":1,
	"V":5,
	"W":6,
	"X":7,
	"Y":7,
	"Z":5
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
	tel = 0;
	screen = ".large-screen";
}
else{
	tel = 1;
	screen = ".small-screen";
}
var port = 5000;
var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
if(host.includes("localhost")){
	host+=":";
}
host+=port;
var socket = io.connect("/");		
var cookie_user = getCookie('user-molux');
var params = getParameters();
if(cookie_user.length<=2){
	window.location.href="/index";
}
var user = JSON.parse(cookie_user);
var partie_en_cours;
var game = {};
var debut = new Date();
var pause = 1, duree = 60*3, seconds=duree;
var motP, motsUtilises = [];
var motsFormesSomme = 0;
var audios = {};
var totalParties = 0;
var MesmessagesNonLus = [];

Notification.requestPermission();

if(cookie_user == ""){
	//Premiere connexion
	window.location.href="/index";
}

if(document.location.href.includes("=")){
	// Il a cliqué sur un lien d'invitation (lien partagé)
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
			let key = checkEvent(_event_).key, spans = document.querySelectorAll(screen+" .lettres .lettre .valeur .valeur2"), elts= document.querySelectorAll(screen+" .lettres .lettre"),letters = [], lettres = [], soluce = "";
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
		_(screen+" .second-screen").style.transform = 'scale(1)';
		_(screen+" .second-screen .cadre").style.display = 'none';
		_(screen+" .second-screen .parametres").style.display = 'flex';
	}

	function fermerParametres(){
		_(screen+" .second-screen").style.transform = 'scale(0)';
	}


	socket.on("message", function (message){
		// console.log(message);
		Bulle('Nouveau Message : '+message);
	})

	
	socket.on('connect', function () {
		console.log("Connexion avec le serveur.");
		socket.emit("connexion json",user);
		document.querySelector("title").innerHTML = "MOLUX - "+user.pseudo;
		_(".small-screen .sidenav .pseudo").innerHTML = user.pseudo + " - " +user.rang+"e Mondial.";
		_(".small-screen .sidenav .circle2").innerHTML = user.pseudo[0].toUpperCase();
		_(".small-screen .sidenav .tel").innerHTML = user.tel;
		console.log(user)

		if(typeof Website2APK !== 'undefined'){
			console.log("pub");
			setTimeout(function (){
				Website2APK.showInterstitialAd();
			}, 15000);
		}
		// _(".small-screen .sidenav .score").innerHTML = user.score;
		// _(".small-screen .sidenav .niveau").innerHTML = user.niveau;
	});

	
	socket.on("non-lus", function (nombreMessages, username){
		if(username == user.pseudo){
			audios.partie.play(1);
			_(screen+" .header-joueurs .niveau-2").innerHTML = '<span class="notification">'+nombreMessages+'</span>';
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
		$(screen+" .page-jeu").fadeOut();
		$(screen+" .page-fin-jeu").fadeIn();
		user.score+=game.score;
		user.parties++;
		user.niveau = parseInt(user.score/100) + 1;
		setCookie("user-molux", JSON.stringify(user), 10);
		socket.emit("end game", game);
	}

	function sendMessageInParties(){
		let messageText = _(screen+" .response-input").textContent;
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
		_(screen+" .response-input").focus();
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
		_(screen+" .response-input").innerHTML = "";		
	}
	function escapeHTML(html) {
		return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
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
	
	
	socket.on("message des parties", function(admin){
		if(partie_en_cours.admin){
			if(partie_en_cours.admin == admin){
				let messages = partie_en_cours.messages;
			//	console.log(messages);
				let a = 0
				_(screen+" .chat .contain").innerHTML = "";
				if(_(screen+" .live-chat").style.display == "flex"){
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
					_(screen+" .notif").style.display = "none";
					audios.game.play(0);
				}
				else{
					_(screen+" .notif").style.display = "flex";
					_(screen+" .notif").innerHTML = MesmessagesNonLus.length;
					audios.partie.play(0);
					new Notification("Molux - Nouveau Message", {"body":MesmessagesNonLus.length+" messages non lus dans la partie de "+admin,"dir":"auto","icon":"https://www.molux.ovh/favicon.ico"})
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
			if(!_(screen+" .box-messages .entete .titre i"))
			_(screen+" .box-messages .entete .titre ").innerHTML += "<i>"+nom_contact.split(" ")[0]+" est entrain d'écrire ...</i>";
		}
	});
	
	socket.on("fin ecrit partie", function(nom_contact, admin){
		if(partie_en_cours.admin == admin){
			if(_(screen+" .box-messages .entete .titre i"))
				_(screen+" .box-messages .entete .titre").removeChild(_(screen+" .box-messages .entete .titre i"));
		}
	});

	function openChat(){
		_(screen+" .live-chat").style.display = "flex";
		_(screen+" .response-input").focus();
		for(let a=0;a<MesmessagesNonLus.length;a++){	
			socket.emit("message des parties lu", MesmessagesNonLus[a], partie_en_cours.admin, user.pseudo);
		}
		MesmessagesNonLus = [];		
		socket.emit("open chat", partie_en_cours.admin);
		scroll();
	}
	
	function closeChat(){
		_(screen+" .live-chat").style.display = "none";
	}
	
	function scroll(){
		$(screen+' .chat').animate({scrollTop : $(screen+' .chat').prop('scrollHeight')}, 500);
		_(screen+" .response-input").focus();
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

		_(screen+" .chat .contain").appendChild(bloc);
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
			
			_(screen+" .mes-mots .total-mots").innerHTML = a;
			_(screen+" .mots-restants .total-mots").innerHTML = b;

			_(screen+" section.page-fin-jeu .corps .right .boutons .btn").setAttribute("onclick", "accueil()");
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
		_(screen+" .c-classement").appendChild(userDiv);
	}

	function addMotFin(mot, place){
		let motDiv = create("div");
		let valeurSpan = create("span");
		motDiv.setAttribute("class", "mot");
		valeurSpan.setAttribute("class", "valeur");
		valeurSpan.innerHTML = mot;
		motDiv.appendChild(valeurSpan);
		_(screen+" .page-fin-jeu ."+place).appendChild(motDiv);
	}

	function creer_partie(){
		document.querySelector("body").onkeyup = ecrit;
		fermerParametres();
		_(screen+" .create.valid-btn").removeAttribute("onclick");
		_(screen+" .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		$(screen+" .page-creation").fadeOut();
		$(screen+" .page-partie").fadeIn();
		_(screen+" .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
		_(screen+" .chat .contain").innerHTML = "";
		$(screen+" .niveau-1.admin").fadeIn();		
		//Création de partie
		var partie = {};
		partie.admin = user.pseudo;
		partie.date = new Date();
		partie.pass = _(screen+" .second-screen .key").value;
		partie.parametres = {};
		partie.parametres.temps = _(screen+" .second-screen .temps .val").innerHTML;
		partie.parametres.pluralite = _(screen+" .second-screen .pluralite .val").innerHTML.toLowerCase();
		partie.parametres.mode = _(screen+" .second-screen .mode .val").innerHTML.toLowerCase();
		partie.parametres.langue = _(screen+" .second-screen .langue .val").innerHTML.toLowerCase();
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
		_(screen+" .second-screen .key").value = chaine;
	}

	function changeTime(signe){
		let temps = parseInt(_(screen+" .second-screen .temps .val").innerHTML);
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
		_(screen+" .second-screen .temps .val").innerHTML = temps;
	}

	function changePluralite(){
		let mot =  _(screen+" .second-screen .pluralite .val").innerHTML.toLowerCase();
		if(mot == 'oui'){
			_(screen+" .second-screen .pluralite .val").innerHTML = "Non";
		}
		else{
			_(screen+" .second-screen .pluralite .val").innerHTML = "Oui";
		}
	}

	function changeMode(){
		let mot =  _(screen+" .second-screen .mode .val").innerHTML.toLowerCase();
		if(mot == 'classique'){
			_(screen+" .second-screen .mode .val").innerHTML = "Tournoi";
		}
		else{
			_(screen+" .second-screen .mode .val").innerHTML = "Classique";
		}
	}

	function changeLangue(){
		let mot =  _(screen+" .second-screen .langue .val").innerHTML.toLowerCase();
		if(mot.toLowerCase() == 'francais'){
			_(screen+" .second-screen .langue .val").innerHTML = "Anglais";
		}
		else{
			_(screen+" .second-screen .langue .val").innerHTML = "Francais";
		}
	}


	socket.on("deconnexion", function(){
		window.location.reload();
		// document.location.href="accueil.html";
	})

	
		
	socket.on("partie rejoint", function (partie){
		if(partie.listeJoueurs.includes(user.pseudo)){
			$(screen+" .page-creation").fadeOut();
			$(screen+" .page-partie").fadeIn();
			_(screen+" .page-partie .niveau-2 .container-niveau-2").innerHTML = '';
			_(screen+" .commencer").innerHTML = "COMMENCER";
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
		$(screen+" .page-creation").fadeIn();
		$(screen+" .page-partie").fadeOut();
		_(screen+" .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
		_(screen+" .create.valid-btn").innerHTML = 'Créer une partie';
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
			let elt = _(screen+" .commencer.inactive");
			elt.removeAttribute("class");
			elt.setAttribute("class", "commencer active");
			elt.setAttribute("onclick", "ready()");
			audios.start.play();
		}
	})

	function ready(){
		let elt = _(screen+" .commencer.active");
		elt.removeAttribute("class");
		elt.setAttribute("class", "commencer inactive");
		_(screen+" button.commencer").removeAttribute("onclick");
		_(screen+" button.commencer").innerHTML ='<img class="loader" src="Images/eclipse-loader.svg"/>';
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
			$(screen+" .regles").fadeOut();
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
		//_(screen+" .corps .min-possibilites .valeur").innerHTML = partie_en_cours.lettres.length;
		afficher_lettres(partie_en_cours.lettres);
		pause = 0;
		tapkey = 1;
		lang = partie_en_cours.parametres.langue;
		compteur(partie_en_cours.parametres.temps,screen+" .header .temps .valeur");

		// M.toast({html: "N'oubliez pas de signaler un bug. Pensez aussi à faire un screenshoot please."});
		audios.game.play(1);
	}

	function mix(){
		retirerTout();
		let z = document.querySelector(screen+" .page-jeu .niveau-2 .lettres");
		let a = document.querySelectorAll(screen+" .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(screen+" .page-jeu .niveau-2 .lettres .lettre .valeur");
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
		_(screen+" .niveau-1.proposes .proposition").style.height = "100%";
		_(screen+" .niveau-1.proposes .proposition .erreur").style.opacity="0";
		if(partie_en_cours.parametres.pluralite == 'non'){
			_(screen+" #"+idlettre+" .valeur").style.transform = "scale(0)";
			_(screen+" #"+idlettre).removeAttribute("onclick");
			var letterSpan = _(screen+" #"+idlettre);
			var letter = _(screen+" #"+idlettre+" .valeur .valeur2").innerHTML;
			_(screen+" .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+'2" onclick="retirer(\''+idlettre+'\')"><span class="valeur">'+letter+'</span></span>'; 
		}
		else{
			let e = (document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre").length);
			
			var letterSpan = _(screen+" #"+idlettre);
			var letter = _(screen+" #"+idlettre+" .valeur .valeur2").innerHTML;
			_(screen+" .proposes .proposition .reste .mot").innerHTML += '<span class="lettre" id="'+idlettre+''+e+'" onclick="retirer2(\''+idlettre+'\','+e+')"><span class="valeur">'+letter+'</span></span>'; 
		}
		
		var a = document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
	}

	function valider_proposition(){

		var a = document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre .valeur");
		motP = ''; 
		for(let i=0;i<a.length;i++){
			motP += a[i].innerHTML; 
		}
		//console.log(motP);
		if(mot_valide(motP) && !motsUtilises.includes(motP)){
			motsUtilises.push(motP);
			game.listeMots.push(motP);
			game.score+=calculer(motP);
			_(screen+" .corps .entete .points .valeur").innerHTML = game.score;
			_(screen+" .niveau-1.proposes .proposition").style.height = "0%";
			var divMot = create("div");
			var valeur = create("span");
			divMot.setAttribute("class", "mot");
			valeur.setAttribute("class", "valeur");
			valeur.innerHTML = motP;
			divMot.appendChild(valeur);
			_(screen+" .proposes .mots").appendChild(divMot);
			retirerTout();
			motP = '';
			motsFormesSomme ++;
			_(screen+" .proposes h2 .totalMotsFormes").innerHTML = motsFormesSomme;
			audios.game.play();

		}
		else{
			audios.game.play(1);

			if(motsUtilises.includes(motP)){
				_(screen+" .niveau-1.proposes .proposition .erreur").innerHTML = 'Ce mot a déjà été utilisé.';
				_(screen+" .niveau-1.proposes .proposition .erreur").style.opacity = 1;
				_(screen+" .niveau-1.proposes .proposition .erreur").style.background = 'mediumvioletred';
			}
			else{
				_(screen+" .niveau-1.proposes .proposition .erreur").innerHTML = "Ce mot n'existe pas dans mon dictionnaire.";
				_(screen+" .niveau-1.proposes .proposition .erreur").style.background = '#F23F3F';
				_(screen+" .niveau-1.proposes .proposition .erreur").style.opacity = 1;
			}
		}
		$(screen+' .proposes .mots').animate({scrollTop : $(screen+' .proposes .mots').prop('scrollHeight')}, 500);
	}

	function retirer(idlettre){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		_(screen+" #"+idlettre+" .valeur").style.transform = "scale(1)";
		_(screen+" #"+idlettre).setAttribute("onclick", "useLettre('"+idlettre+"')");
		let elt = _(screen+" .lettre#"+idlettre+'2');
		//console.log(elt);
		_(screen+" .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(screen+" .niveau-1.proposes .proposition").style.height = "0%";
		}
		delete uses[uses.indexOf(idlettre)];
	}
	
	function retirer2(idlettre, nomb){
		//console.log("Vous souhaitez retirer la lettre d'id : "+idlettre);
		let elt = _(screen+" .lettre#"+idlettre+''+nomb);
		//console.log(elt);
		_(screen+" .proposes .proposition .reste .mot").removeChild(elt);
		let a = document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre");
		if(a.length == 0){
			_(screen+" .niveau-1.proposes .proposition").style.height = "0%";
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
		let a = document.querySelectorAll(screen+" .proposes .proposition .reste .mot .lettre");
		for(let i=0;i<a.length;i++){
			_(screen+" .proposes .proposition .reste .mot").removeChild(a[i]);	
		}	
		a = document.querySelectorAll(screen+" .page-jeu .niveau-2 .lettres .lettre");
		let b = document.querySelectorAll(screen+" .page-jeu .niveau-2 .lettres .lettre .valeur");
		for(let i=0;i<a.length;i++){
			a[i].setAttribute("onclick", "useLettre('"+a[i].id+"')");
			b[i].style.transform = "scale(1)";
		}	
		_(screen+" .page-jeu .niveau-1.proposes .proposition").style.height = "0%";
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
			let container = _(screen+" .corps .lettres");
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
		$(screen+" .page-jeu").fadeIn();
		$(screen+" .page-jeu .regles").fadeIn();
		$(screen+" .page-creation").fadeOut();
		$(screen+" .page-partie").fadeOut();
		socket.emit("lancer partie", partie_en_cours);

	}

	socket.on("partie lancee", function (jeu){
		if(jeu.admin == partie_en_cours.admin){
			$(screen+" .page-jeu").fadeIn();
			$(screen+" .page-jeu .regles").fadeIn();
			$(screen+" .page-creation").fadeOut();
			$(screen+" .page-partie").fadeOut();
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

	socket.on("rang", function (rang){
		user.rang = rang;
		$(".rang").html(rang);
		_(".small-screen .sidenav .pseudo").innerHTML = user.pseudo + " - " +user.rang+"e Mondial.";
	})
	socket.on("retirer", function (nom){
		if(nom == user.pseudo){
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
		var personnes= _(screen+" .page-partie .niveau-2 .container-niveau-2");
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

	
	function partie(admin){
		document.querySelector("body").onkeyup = ecrit;
		//socket.emit("open chat", admin);

		//Rejoindre la partie de admin
		//console.log("Vous avez demandé à rejoindre la partie de "+admin);
		_(screen+" .create.valid-btn").removeAttribute("onclick");
		_(screen+" .create.valid-btn").innerHTML = '<img class="loader" src="Images/eclipse-loader.svg"/>';
		
		$(screen+" .niveau-1.admin").fadeOut();		
		socket.emit("check password", admin);
		//socket.emit("joindre partie", admin);
	}

	socket.on("partie securisee", function(partie){
		_(screen+" .second-screen").style.transform = 'scale(1)';
		_(screen+" .second-screen .cadre").style.display = 'none';
		_(screen+" .second-screen .password").style.display = 'flex';
		_(screen+" .second-screen .password .valid").setAttribute("onclick", "validPass('"+partie.admin+"', '"+partie.pass+"')");
	})
	
	function validPass(admin, password){
		let pass = _(screen+" .second-screen .password .pass").value;
		if(pass.toLowerCase() == password.toLowerCase()){
			_(screen+" .second-screen").style.transform = 'scale(0)';
		    socket.emit("joindre partie", admin);
		}
		else{
			audios.erreur.play(1);
			_(screen+" .second-screen .password .erreur").innerHTML = "Mot de passe erroné !";
			_(screen+" .second-screen .password .pass").focus();
		}
	}

	function create(elt){
		return document.createElement(elt);
	}





	
	
	function share(){
		if(typeof(Website2APK) != "undefined"){
			Website2APK.shareIntent();
		}
		else{
			// console.log("Partager l'application");
			Navigator.share();
		}
	}




	socket.on("message", function (message){
		console.log(message);
		M.toast({html: message});
		new Notification("Molux", {"body":message,"dir":"auto","icon":"https://www.molux.ovh/favicon.ico"})

	})

	socket.on('disconnect', function () {
		M.toast({html: 'Déconnexion ...'});
		new Notification("Molux", {"body":"Vous avez été déconnecté !","dir":"auto","icon":"https://www.molux.ovh/favicon.ico"})
	});

	socket.on("replace partie", function (name, part){
		if(partie_en_cours.admin == name){
			// Changement d'admin
			partie_en_cours = part;
			game.admin = part.admin;
			M.toast({html: name+" a quitté votre partie. L'admin est désormais "+part.admin})
			socket.emit("replace partie", name, part);
		}
	});

	function accueil(){
		window.location.reload();
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



	function deconnexionVerif(){
		$('.modal.deconnexion').modal();
		$('.modal.deconnexion').modal('open');
	}
	
	if(tel == 1){
		
		socket.on("utilisateur connecte", function (joueurs){
			let a=0;
			document.querySelector(".small-screen .joueurs .les-joueurs").innerHTML = '';		
			_(".small-screen .joueurs .aucune-partie").style.display = 'none';
			for(var nom in joueurs){
				addJoueur(joueurs[nom]);
				a++;
			}
		
			//new Notification("Molux - Nouvel utilisateur", {"body":a+" utilisateur(s) connecté(s).","dir":"auto","icon":"https://www.molux.ovh/favicon.ico"})
	//		if(a>0)
	//			_(".joueur-tab a").innerHTML = "JOUEURS ("+a+")";
			
		})
		
		$(document).ready(function(){
			// $(".chargement-accueil").fadeOut();
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
		
		document.addEventListener('DOMContentLoaded', function() {
			var elems = document.querySelectorAll('.small-screen .sidenav');
			var instances = M.Sidenav.init(elems);
		});
		// var instance = M.Tabs.init(el);


	}
	else{
		socket.on("parties", function (parties){
			let a = 0; // a > 0 signiife qu'il y'a plusieurs parties en cours
			let b = 0; // b = 1 signifie que le joueur a une partie en cours
			document.querySelector(screen+" .les-parties").innerHTML = '';	
			for(var admin in parties){
				if(parties[admin].admin != user.pseudo){
					_(screen+" .aucune-partie").style.display = 'none';
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
				_(screen+" .aucune-partie").style.display = 'inline-block';
				document.querySelector(screen+" .les-parties").innerHTML = '';	
				$(screen+" .page-creation").fadeIn();
				$(screen+" .page-partie").fadeOut();
			}
			if(b == 0){
				_(screen+" .create.valid-btn").setAttribute("onclick", "ouvrirParametres()");
				_(screen+" .create.valid-btn").innerHTML = 'Créer une partie';
				partie_en_cours = {};
			}
			user.etat = b;
		});

		function addPartie(partie){
			if(!document.querySelector(screen+" #"+partie.admin)){
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
				var parties = document.querySelector(screen+" .les-parties");
	
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

	function tab(elt){
		//$("section").fadeOut();
		$("."+elt).fadeIn();
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



		



document.onreadystatechange = function(e)
{
  if(document.readyState=="interactive")
  {
    var all = document.getElementsByTagName("*");
    for (var i=0, max=all.length; i < max; i++) 
    {
      set_ele(all[i]);
    }
  }
}

function check_element(ele)
{
  var all = document.getElementsByTagName("*");
  var totalele=all.length;
  var per_inc=100/all.length;

  if($(ele).on())
  {
    var prog_width=per_inc+Number(document.getElementById("progress_width").value);
	document.getElementById("progress_width").value=prog_width;
    $("#bar1").animate({width:prog_width+"%"},1,function(){
      if(document.getElementById("bar1").style.width>="100%")
      {
		$(".progress").fadeOut("slow");
		$(".chargement-accueil").fadeOut("slow");
      }			
    });
  }

  else	
  {
    set_ele(ele);
  }
}

function set_ele(set_element)
{
  check_element(set_element);
}