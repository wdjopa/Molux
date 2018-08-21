var port = 5000;
var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
if(host.includes("localhost")){
	host+=":";
}
host+=port;

var statuses = [];
var socket = io.connect("/");		
var cookie_user = getCookie('user');
var params = getParameters();
var user = JSON.parse(cookie_user);
var currentContact;
var allContacts;
var audios = {};
var tempsMessageRecharge;

audios.message = {};
audios.message.src = ["Audios/debut partie.mp3","Audios/game over.wav"];
audios.message.play = function (indice=0){
//	alert(indice);
	_("audio.tonalite").src = this.src[indice]; 
	_("audio.tonalite").currentTime = 0;
	_("audio.tonalite").play(); 
}


document.querySelector("body").onkeyup = clavier;

function checkEvent( _event_ ){
	if ( window.event )
		return window.event;
	else
		return _event_;
}

function clavier(_event_){
	let key = checkEvent(_event_).key, spans = document.querySelectorAll(".large-screen .lettres .lettre .valeur"), elts= document.querySelectorAll(".large-screen .lettres .lettre"),letters = [], lettres = [], soluce = "";
	
	if (checkEvent(_event_).keyCode == 13){
		send();
	}
	
}

socket.on("deconnexion", function(){
	deconnexion();
})

socket.on('connect', function () {
	console.log("Connexion avec le serveur.");
	socket.emit("connexion json",user);
	document.querySelector("title").innerHTML = "MOLUX - "+user.name;
});

socket.on("message", function (message){
	console.log(message);
})

socket.on('disconnect', function () {
	console.log("Déconnexion avec le serveur.");
});

socket.on("utilisateur connecte", function (utilisateursConnectes){
	for(name in utilisateursConnectes){
		if(name != user.name){
			//Mettre les personnes avec le mot name en ligne.
		}
	}
});

socket.on("contacts", function (contacts, nom=''){
	console.log(nom);
	console.log(contacts);
	if(nom == user.name){
		allContacts = contacts;
		_(".bloc-joueurs .corps .liste .liste-result").innerHTML = "";
		socket.emit("unread");
		for (contact in contacts) {
			addContact(contacts[contact]);	
		}
	}
})

function addContact(contact){
	let utilisateur = contact.user;

	/*
	<div class="contact">
		<div class="left">
			<h4 class="nom">Djopa</h4>
			<div class="autre">
				<span class="niveau">Niveau 4</span> - <span class="points">830 pts</span>
			</div>
		</div>
		<div class="right">
			<span class="notification">
				<span class="value">23</span>
			</span>
		</div>
	</div>

	*/
	let contactDiv = create("div");
	let leftDiv = create("div");
	let rightDiv = create("div");
	let nomDiv = create("h4");
	let autreDiv = create("div");
	let pointsDiv = create("span");
	let notificationsDiv = create("span");
	let valueDiv = create("span");
	let niveauDiv = create("span");

	contactDiv.setAttribute("class","contact "+utilisateur.pseudo.replace(/ /g,""));
	contactDiv.setAttribute("onclick","ouvrirConversation('"+utilisateur.pseudo.replace(/ /g,"")+"')");
	leftDiv.setAttribute("class","left");
	rightDiv.setAttribute("class","right");
	nomDiv.setAttribute("class","nom");
	autreDiv.setAttribute("class","autre");
	pointsDiv.setAttribute("class","points");
	notificationsDiv.setAttribute("class","notification");
	valueDiv.setAttribute("class","value");
	niveauDiv.setAttribute("class","niveau");

	pointsDiv.innerHTML = utilisateur.score + " pts";
	niveauDiv.innerHTML = "Niveau "+utilisateur.niveau+" - ";
	nomDiv.innerHTML = utilisateur.pseudo;
	valueDiv.innerHTML = 0;
	
	valueDiv.style.display = "none";
	notificationsDiv.style.display = "none";

	autreDiv.appendChild(niveauDiv);
	autreDiv.appendChild(pointsDiv);
	leftDiv.appendChild(nomDiv);
	leftDiv.appendChild(autreDiv);
	rightDiv.appendChild(notificationsDiv);
	notificationsDiv.appendChild(valueDiv);
	contactDiv.appendChild(leftDiv);
	contactDiv.appendChild(rightDiv);	
	


	_(".bloc-joueurs .corps .liste .liste-result").appendChild(contactDiv);
}

socket.on("update contacts", function(contacts){
	allContacts = contacts;
})

function ouvrirConversation(contact){
	statuses = [];
	clearInterval(tempsMessageRecharge);
	currentContact = allContacts[contact];
	let utilisateur = currentContact.user;
	if(_(".bloc-joueurs .corps .liste .liste-result .active-contact")){
		let listeAttributs = _(".bloc-joueurs .corps .liste .liste-result .active-contact").classList;
		_(".bloc-joueurs .corps .liste .liste-result .active-contact").setAttribute("class", "contact "+listeAttributs[2]);
	}
	_(".bloc-joueurs .corps .liste .liste-result .contact."+utilisateur.pseudo.replace(/ /g,"")).setAttribute("class","contact active-contact "+utilisateur.pseudo.replace(/ /g,""));
	chargerMessages(currentContact);

	tempsMessageRecharge = setInterval(function (){
		for(let i=0;i<document.querySelectorAll(".message .status").length;i++){
			document.querySelectorAll(".message .status")[i].innerHTML = direDate(statuses[i]);
		}
	}, 1000);

}

function chargerMessages(contact){
	let messages = contact.messages.all;
	let limite = 40;
	console.log(allContacts);
	console.log(contact);
	_("section .messages-container").innerHTML = "";
	_("section .default-page").style.height = "0px";
	_("section .default-page").style.opacity = "0";
	
	console.log(messages);
	// for(let i=messages.length-1; i>=0;i--){
	for(let i=0; i<messages.length;i++){
		let message = messages[i];
		addMessage(message);
		limite--;
		if(limite <= 0){
			break;
		}
	}
	socket.emit("charger unread", contact.user.pseudo);
	// scroll();
}

var ecriture;


function ecrit(){
	clearTimeout(ecriture);
	socket.emit("ecrit", currentContact.user.pseudo);
	ecriture = setTimeout(function (){
		socket.emit("fin ecrit", currentContact.user.pseudo);
	}, 1000);
}

socket.on("ecrit", function(nom_contact, me){
	if(user.pseudo == me){
		if(!_("."+nom_contact.replace(/ /g,"")+" .nom i"))
		_("."+nom_contact.replace(/ /g,"")+" .nom").innerHTML += "<i> écrit</i>";
	}
});

socket.on("fin ecrit", function(nom_contact, me){
	if(user.pseudo == me){
		_("."+nom_contact.replace(/ /g,"")+" .nom").removeChild(_("."+nom_contact.replace(/ /g,"")+" .nom i"));
	}
});



function send(){

	let texteMessage = _(".texte-message .input-message").innerHTML;
	let message = {};
	message.sender = user.name;
	message.receiver = currentContact.user.pseudo;
	message.texte = texteMessage;
	message.date = new Date();

	if(message.texte.trim() != ""){
		socket.emit("new message", message);
	}
	
	_(".texte-message .input-message").innerHTML = "";
	scroll();
}

socket.on("afficher", function (message){
	addMessage(message);
})

function addMessage(message){
	/*
		<div class="message send">
			<div class="message-bloc">
				<div class="message-container">
					<div class="media-container"></div>
					<div class="message-text">Salut comment ça va ?</div>
				</div>
				<div class="status">Envoyé hier à 11:49</div>
			</div>	
		</div>

	*/
	let messageSend = create("div");
	let messageBloc = create("div");
	let messageContainer = create("div");
	let mediaContainer = create("div");
	let messageText = create("div");
	let status = create("div");

	messageText.innerHTML = message.texte;
	status.innerHTML = direDate(message.date);
	statuses.push(message.date);

	if(message.sender == user.name){
		messageSend.setAttribute("class", "message send");
	}
	else{
		messageSend.setAttribute("class", "message receive");
	}
	messageBloc.setAttribute("class", "message-bloc");
	messageContainer.setAttribute("class", "message-container");
	messageText.setAttribute("class", "message-text");
	status.setAttribute("class", "status");

	messageContainer.appendChild(mediaContainer);
	messageContainer.appendChild(messageText);
	messageBloc.appendChild(messageContainer);
	messageBloc.appendChild(status);
	messageSend.appendChild(messageBloc);

	_("section .messages-container").appendChild(messageSend);
	
	//scroll();
}


socket.on("charger unread", function (contact, unreads){
	if(unreads){
		let messagesNonLus = 0;
		if(unreads[contact]){
			console.log(contact);
			console.log(currentContact);
			if(currentContact.user.pseudo == contact){
				console.log("if");
				for(let i=0;i<unreads[contact].length;i++){
					let message = unreads[contact][i];
					addMessage(message);
				}
				audios.message.play(1);
				socket.emit("lus", contact, unreads[contact]);
				_(".contacts .contact."+contact+" .notification").style.display = "none";
				_(".contacts .contact."+contact+" .notification .value").style.display = "none";
				scroll();
			}
			else{
				audios.message.play();
				if(unreads[name].length>0){
					messagesNonLus+=unreads[name].length;
					_(".contacts .contact."+name+" .notification").style.display = "flex";
					_(".contacts .contact."+name+" .notification .value").style.display = "inline-block";
					_(".contacts .contact."+name+" .notification .value").innerHTML = unreads[name].length;
				}
			}
		}
		if(messagesNonLus > 0){
			if(messagesNonLus == 1){
				_("title").innerHTML = user.name + " ("+messagesNonLus+" message non lu) - MOLUX";
			}
			else{
				_("title").innerHTML = user.name + " ("+messagesNonLus+" messages non lus) - MOLUX";
			}
		}
	}
});

socket.on("unread", function (username, unreads){
	if(username == user.name){
		let messagesNonLus = 0;
		for(name in unreads){
			if(currentContact){
				if(currentContact.user.pseudo == name){
					for(let i=0;i<unreads[name].length;i++){
						let message = unreads[name][i];
						addMessage(message);
					}
					audios.message.play(1);
					socket.emit("lus", name, unreads[name]);
					_(".contacts .contact."+name+" .notification").style.display = "none";
					_(".contacts .contact."+name+" .notification .value").style.display = "none";
					scroll();
				}
				else{
					audios.message.play();
					if(unreads[name].length>0){
						messagesNonLus+=unreads[name].length;
						_(".contacts .contact."+name+" .notification").style.display = "flex";
						_(".contacts .contact."+name+" .notification .value").style.display = "inline-block";
						_(".contacts .contact."+name+" .notification .value").innerHTML = unreads[name].length;
					}
				}
			}
			else{
				if(unreads[name].length>0){
					messagesNonLus+=unreads[name].length;
					_(".contacts .contact."+name+" .notification").style.display = "flex";
					_(".contacts .contact."+name+" .notification .value").style.display = "inline-block";
					_(".contacts .contact."+name+" .notification .value").innerHTML = unreads[name].length;
				}
			}
		}
		
		if(messagesNonLus > 0){
			if(messagesNonLus == 1){
				_("title").innerHTML = user.name + " ("+messagesNonLus+" message non lus) - MOLUX";
			}
			else{
				_("title").innerHTML = user.name + " ("+messagesNonLus+" messages non lus) - MOLUX";
			}
			socket.emit("non-lus", messagesNonLus, user.name);
		} 
	}
})

function scroll(){
	$('section .messages-container').animate({scrollTop : $('section .messages-container').prop('scrollHeight')}, 500);
	_(".input-message").focus();
}

function search(){
	let search = _("#search").value;
	if(search.length > 0){
		//_(".bloc-joueurs .corps .liste .resultat").style.display = "block";
		socket.emit("search", search);
	}
	else{
		socket.emit("search", search);
		_(".bloc-joueurs .corps .liste .resultat").style.display = "none";
		_(".bloc-joueurs .corps .liste .resultat").innerHTML = "";
	}
}

socket.on("results search", function (names){
	_(".resultats-recherche").style.display = "flex";
	console.log(names);
	// _(".bloc-joueurs .corps .liste .resultat").innerHTML = "";
	_(".search-container .corps .resultats-recherche").innerHTML = '';
	let index;
	for (index = 0; index < names.length; index++) {
		const name = names[index];
		// if(name != user.name)
		addResult(name);
	}
	if(index == 0){
		_(".search-container .corps .resultats-recherche").innerHTML = '<h4 class="null">Aucun contact n\'est enregistré à ce nom</h4>';
	}
});

function addResult(name){

	let contactDiv = create("div");
	let nomDiv = create("h4");

	contactDiv.setAttribute("onclick","newContact('"+name+"')");
	contactDiv.setAttribute("class","search-contact");
	nomDiv.setAttribute("class","nom");
	
	nomDiv.innerHTML = name;
	
	contactDiv.appendChild(nomDiv);
	
	_(".search-container .corps .resultats-recherche").appendChild(contactDiv);
}

function newContact(nom){
	closeFenetre("search-container");
	_("#search").value = "";
	_(".resultats-recherche").style.display = "none";
	console.log("Ajout du contact "+nom+" dans la liste des contacts");
	socket.emit("add to contact", nom);
}

function closeFenetre(w){
	$("."+w).fadeOut();
}

function searchBox(){
	_(".search-container").style.display = "flex";
	$(".search-container").fadeIn();
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
					chaine = "Il y'a " + (heureB-heureA) + " heure(s)";
					chaine = "Envoyé le "+jourA+"/"+moisA+" à "+heureA+":"+minuteA;
				}
			}
			else{
				chaine = "Il y'a " + (jourB-jourA) + " jour(s)";
				chaine = "Envoyé le "+jourA+"/"+moisA+" à "+heureA+":"+minuteA;
			}
		}
		else{
			chaine = "Il y'a " + (moisB-moisA) + " mois";
			chaine = "Envoyé le "+jourA+"/"+moisA+"/"+anneeA+" à "+heureA+":"+minuteA;
		}
	}
	else{
		chaine = "Il y'a " + (anneeB-anneeA) + " an(s)";
		chaine = "Envoyé le "+jourA+"/"+moisA+"/"+anneeA+" à "+heureA+":"+minuteA;
	}

	return chaine;
}



function ouvrir(link){
	document.location.href = "http://molux.eu-4.evennode.com/"+link;
}
