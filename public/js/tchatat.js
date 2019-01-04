
	function random(min, max){
		if(max <= min)
			return min;
		else
			return (parseInt( Math.random() * 1000 ) + min) % (max - min) + min;
	}
	
	function in_array(elt, tab){
		var i, a=0;
		for(i=0 ; i<tab.length ; i++)
			if(tab[i] == elt)
			{
				a = 1;
				break;
			}
		return a;
	}
	function del(elt, tab){
		var i, a=-1;
		for(i=tab.length-1 ; i>=0 ; i--)
			if(tab[i] == elt)
				a = i;
		clearTimeout(tab[a]);
		supprbypos(a, tab);
		console.log(tab);
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
	}
	function supprbypos(a, tab){
		var i;
		for(i=a ; i<tab.length ; i++){
			tab[i] = tab[i+1];
		}
		tab.pop();
	}
