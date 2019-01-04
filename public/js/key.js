
KEY_DOWN	= 40;
KEY_UP		= 38;
KEY_LEFT	= 37;
KEY_RIGHT	= 39;

KEY_END		= 35;
KEY_BEGIN	= 36;



KEY_BACK_TAB = 8;
KEY_TAB	     = 9;
KEY_SH_TAB   = 16;
KEY_ENTER	 = 13;
KEY_ESC		 = 27;
KEY_SPACE	 = 32;
KEY_DEL		 = 46;

KEY_A		= 65;
KEY_B		= 66;
KEY_C		= 67;
KEY_D		= 68;
KEY_E		= 69;
KEY_F		= 70;
KEY_G		= 71;
KEY_H		= 72;
KEY_I		= 73;
KEY_J		= 74;
KEY_K		= 75;
KEY_L		= 76;
KEY_M		= 77;
KEY_N		= 78;
KEY_O		= 79;
KEY_P		= 80;
KEY_Q		= 81;
KEY_R		= 82;
KEY_S		= 83;
KEY_T		= 84;
KEY_U		= 85;
KEY_V		= 86;
KEY_W		= 87;
KEY_X		= 88;
KEY_Y		= 89;
KEY_Z		= 90;

KEY_PF1		= 112;
KEY_PF2		= 113;
KEY_PF3		= 114;
KEY_PF4		= 115;
KEY_PF5		= 116;
KEY_PF6		= 117;
KEY_PF7		= 118;
KEY_PF8		= 119;

KEY_0       = 96;
KEY_1       = 97;
KEY_2       = 98;
KEY_3       = 99;
KEY_4       = 100;
KEY_5       = 101;
KEY_6       = 102;
KEY_7       = 103;
KEY_8       = 104;
KEY_9       = 105;
KEY_Multiply       = 106;
KEY_Add       = 107;
KEY_Substract       = 109;
KEY_Enter       = 13;
KEY_Divide       = 111;
KEY_Space       = 32;
KEY_Decimal	       = 110;
KEY_Back	       = 8;
REMAP_KEY_T	= 5019;
	
function checkEventObj ( _event_ ){
	// --- IE explorer
	if ( window.event )
		return window.event;
	// --- Netscape and other explorers
	else
		return _event_;
}
	
function applyKey (_event_){
	
	// --- Retrieve event object from current web explorer
	var winObj = checkEventObj(_event_);
	
	var intKeyCode = winObj.keyCode;
	var intAltKey = winObj.altKey;
	var intCtrlKey = winObj.ctrlKey;
		
	// --- Access with [ALT/CTRL+Key]
	if (intAltKey || intCtrlKey) {
		
		if ( intKeyCode == KEY_RIGHT || intKeyCode == KEY_LEFT ){
			
			// --- Display Message
			alert("Hello with ALT/CTRL !");
			
			// --- Map the keyCode in another keyCode not used
			winObj.keyCode = intKeyCode = REMAP_KEY_T;
			winObj.returnValue = false;
			return false;
		}
		
	}
	// --- Access without [ALT/CTRL+Key]
	else {
		
		if ( intKeyCode == KEY_Enter){
			init();
			winObj.keyCode = intKeyCode = REMAP_KEY_T;
			winObj.returnValue = false;
			return false;
		}
		
	}
	
}
	
function applyKey2 (_event_){
	
	// --- Retrieve event object from current web explorer
	var winObj = checkEventObj(_event_);
	
	var intKeyCode = winObj.keyCode;
	var intAltKey = winObj.altKey;
	var intCtrlKey = winObj.ctrlKey;
		
	// --- Access with [ALT/CTRL+Key]
	if (intAltKey || intCtrlKey) {
		
		if ( intKeyCode == KEY_RIGHT || intKeyCode == KEY_LEFT ){
			
			// --- Display Message
			alert("Hello with ALT/CTRL !");
			
			// --- Map the keyCode in another keyCode not used
			winObj.keyCode = intKeyCode = REMAP_KEY_T;
			winObj.returnValue = false;
			return false;
		}
		
	}
	// --- Access without [ALT/CTRL+Key]
	else {
		
		if ( intKeyCode == KEY_Enter){
			init();
			winObj.keyCode = intKeyCode = REMAP_KEY_T;
			winObj.returnValue = false;
			return false;
		}
		
	}
	
}

