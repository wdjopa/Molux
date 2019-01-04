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
	console.log(cookie_user);
    var user = JSON.parse(cookie_user);
        
    socket.on("deconnexion", function(){
        deconnexion();
    })

    socket.on('connect', function () {
        console.log("Connexion avec le serveur.");
        socket.emit("connexion json",user);
        document.querySelector("title").innerHTML = "MOLUX - "+user.name;
    });

    _(".large-screen .partie-gauche .profil-box .pseudo .valeur").innerHTML = user.pseudo.toUpperCase();
    _(".large-screen .partie-gauche .profil-box .niveau .valeur").innerHTML = user.niveau;
    _(".large-screen .partie-gauche .profil-box .score .valeur").innerHTML = user.score;
    _(".large-screen .partie-gauche .profil-box .langue .valeur").innerHTML = user.langue;

    _(".large-screen .partie-gauche .infos-box .parties .valeur").innerHTML = user.parties;
    _(".large-screen .partie-gauche .infos-box .pays .valeur").innerHTML = user.pays;
    _(".large-screen .partie-gauche .infos-box .dat .valeur").innerHTML = direDate(user.date);
 
 
    _(".large-screen .partie-droite .coordonnees-box .pseudo .valeur").innerHTML = user.pseudo;
    _(".large-screen .partie-droite .coordonnees-box .email .valeur").innerHTML = user.email;
    _(".large-screen .partie-droite .coordonnees-box .langue .valeur").innerHTML = user.langue;
    _(".large-screen .partie-droite .coordonnees-box .password .valeur").innerHTML = user.password;
    _(".large-screen .partie-droite .coordonnees-box .tel .valeur").innerHTML = user.tel;

}
else{
    var port = 5000;
	var host = document.location.href.split(":")[0]+":"+document.location.href.split(":")[1];
	if(host.includes("localhost")){
		host+=":";
	}
	host+=port;
	var socket = io.connect("/");		
	var cookie_user = getCookie('user');
	var params = getParameters();
	console.log(cookie_user);
    var user = JSON.parse(cookie_user);

    
	function share(){
		if(typeof(Website2APK) != "undefined"){
			Website2APK.shareIntent();
		}
		else{
			console.log("Partager l'application");
			Navigator.share();
		}
	}

        
    socket.on("deconnexion", function(){
        deconnexion();
    })

    socket.on('connect', function () {
        console.log("Connexion avec le serveur.");
        socket.emit("connexion json",user);
        document.querySelector("title").innerHTML = "MOLUX - "+user.name;
        _(".small-screen .sidenav .pseudo").innerHTML = user.name;
		_(".small-screen .sidenav .circle2").innerHTML = user.name[0].toUpperCase();
		_(".small-screen .sidenav .tel").innerHTML = user.tel;
		if(typeof(Website2APK) == 'undefined'){
			console.log("pub");
		}
		else{
			setTimeout(function (){
				Website2APK.showInterstitialAd();
			}, 15000);
		}
    });

    
    _(".small-screen .partie-gauche .profil-box .pseudo .valeur").innerHTML = user.pseudo.toUpperCase();
    _(".small-screen .partie-gauche .profil-box .niveau .valeur").innerHTML = user.niveau;
    _(".small-screen .partie-gauche .profil-box .score .valeur").innerHTML = user.score;
    _(".small-screen .partie-gauche .profil-box .langue .valeur").innerHTML = user.langue;

    _(".small-screen .partie-gauche .infos-box .parties .valeur").innerHTML = user.parties;
    _(".small-screen .partie-gauche .infos-box .pays .valeur").innerHTML = user.pays;
    _(".small-screen .partie-gauche .infos-box .dat .valeur").innerHTML = direDate(user.date);
 
 
    _(".small-screen .partie-droite .coordonnees-box .pseudo .valeur").value = user.pseudo;
    _(".small-screen .partie-droite .coordonnees-box .email .valeur").value = user.email;
    _(".small-screen .partie-droite .coordonnees-box .pays .valeur").value = user.pays;
    _(".small-screen .partie-droite .coordonnees-box .langue .valeur").value = user.langue;
    _(".small-screen .partie-droite .coordonnees-box .password .valeur").value = user.password;
    _(".small-screen .partie-droite .coordonnees-box .tel .valeur").value = user.tel;


    function modifier(elt){
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .valeur").removeAttribute("readonly");
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .valeur").focus();
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .valeur").value = user[elt];
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .btn").innerHTML = "ENREGISTRER";
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .btn").setAttribute("onclick", "enregistrer('"+elt+"')");
        
    }
    
    function enregistrer(elt){
        console.log(elt);
        let val = escapeHTML(_(".small-screen .partie-droite .coordonnees-box ."+elt+" .valeur").value);
        socket.emit("update data", elt, val);
    }
    socket.on("update finish", function(user){
        setCookie("user", JSON.stringify(user), 10);
        window.location.reload();
    })
    socket.on("update error", function(elt){
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .input").style.border = "2px solid red";
        _(".small-screen .partie-droite .coordonnees-box ."+elt+" .valeur").focus();
    })
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
					chaine = "Hier";
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


$(document).ready(function(){
	$(".chargement-accueil").fadeOut();
	$('.tap-target').tapTarget();
    $('.tooltipped').tooltip();
    $('.sidenav').sidenav();
    $('.tap-target').tapTarget('open');

	setTimeout(function (){
		$('.tap-target').tapTarget('close');
	}, 6000)
});
        

function ouvrir(link){
    document.location.href = "http://molux.eu-4.evennode.com/"+link;
}

function verifyMessage(texte){
    let t = " ";
    let textes = texte.split(" ");
    console.log(textes);
    for(let i=0;i<textes.length;i++){
        let mot = textes[i];
        t+=URL(mot)+" ";
        console.log(t);
    }
    return t;
}

function escapeHTML(html) {
    return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}