VISH.Flashcard = (function(V,$,undefined){

	var flashcards;
	// myFlashcard = flashcards['flashcardId'] has:
	// myFlashcard.arrows = [arrow1,arrow2,...,arrow3];
	// myFlashcard.timer = arrowTimer;
	//Each arrow has id, position and a associated slide id

	//Direct access to pois data.
	var pois;

	//Arrow rendering information
	//Arrow frames per second
	var FPS = 20;

	var init = function(presentation){
		if(!flashcards){
			flashcards = {};
			pois = {};
		}
	};

	var startAnimation = function(slideId){
		if((typeof flashcards !== "undefined")&&(typeof flashcards[slideId] !== "undefined")&&(typeof flashcards[slideId].timer == "undefined")){
			flashcards[slideId].timer = setInterval( function() { animateArrows(slideId); }, 1000/FPS );      
		}
	};

	var stopAnimation = function(slideId){
		if((typeof flashcards !== "undefined")&&(typeof flashcards[slideId] !== "undefined")&&(typeof flashcards[slideId].timer !== "undefined")){
			clearTimeout(flashcards[slideId].timer);
			flashcards[slideId].timer = undefined;
		}
	};

	/*  Sync can be true if you want the arrows to be synchronized 
	*   (moving at the same time and at the same position) or false if not
	*/
	var addArrow = function(fcId, poi){

		if((!poi)||(!poi.x)||(!poi.y)||(poi.x > 100)||(poi.y > 100)){
			//Corrupted poi
			return;
		}

		var flashcard_div = $("#"+ fcId);
		var poiId = V.Utils.getId(fcId + "_poi");
		var div_to_add = "<div class='fc_poi' id='" + poiId + "' style='position:absolute;left:"+poi.x+"%;top:"+poi.y+"%'></div>";
		flashcard_div.append(div_to_add);

		if(typeof flashcards[fcId] === "undefined"){
			flashcards[fcId] = new Object();
			flashcards[fcId].arrows = [];
		}

		//Add arrow
		var arrow = new Object();
		arrow.id = poiId;
		arrow.slide_id = poi.slide_id;
		arrow.x = poi.x;
		arrow.y = poi.y;
		
		flashcards[fcId].arrows.push(arrow);
		pois[arrow.id] = arrow;

		//Add event to the arrow
		$("#" + poiId).click(function(event){
			V.Events.onFlashcardPoiClicked(poiId);
		});
	};

	var animateArrows = function(slideId){
		if((!slideId)||(typeof flashcards[slideId] === "undefined")){
			return;
		}
		$(flashcards[slideId].arrows).each(function(index,value){
			var arrowDOM = $("#"+value.id);
			var backgroundPosX = $(arrowDOM).cssNumber("background-position-x")+5;
			//backgroundPosX should be a number between 0 and 95
			if(backgroundPosX>95){
				backgroundPosX = 0; //bucle
			}
			$(arrowDOM).css("background-position",backgroundPosX + "%" + " center");
		});
	};

	var getPoiData = function(poiId){
		if((typeof pois !== "undefined")&&(typeof pois[poiId] !== "undefined")){
			return pois[poiId];
		}
		return null; 
	};

	var aftersetupSize = function(increase,increaseW){
		var fcArrowIncrease;
		if(increase >= 1){
			fcArrowIncrease = V.ViewerAdapter.getPonderatedIncrease(increase,0.1);
		} else {
			fcArrowIncrease = V.ViewerAdapter.getPonderatedIncrease(increase,0.8);
		}

		//Update arrows
		//Use geometric formulas to properly allocate the arrows after setup size
		//This way, arrows always point to the same spot
		for(var fckey in flashcards) {
			var fc = flashcards[fckey];
			var arrows = fc.arrows;
			$(arrows).each(function(index,arrow){
				var orgX = arrow.x * 8;
				var newWidth = 50*fcArrowIncrease;
				var newLeft = increase * orgX + 25 *(increase - fcArrowIncrease);

				var orgY = arrow.y * 6;
				var newHeight = 40*fcArrowIncrease;
				var newTop = increase * orgY + 40 * 0.8 * (increase - fcArrowIncrease);

				var arrowDom = $("#"+arrow.id);
				$(arrowDom).css("left",newLeft+"px");
				$(arrowDom).width(newWidth+"px");
				$(arrowDom).css("top",newTop+"px");
				$(arrowDom).height(newHeight+"px");
			});
		}
	};

	var getFlashcards = function(){
		return flashcards;
	};

	return {
		init			: init,
		addArrow 		: addArrow,
		startAnimation	: startAnimation,
		stopAnimation	: stopAnimation,
		animateArrows	: animateArrows,
		getPoiData		: getPoiData,
		aftersetupSize	: aftersetupSize,
		getFlashcards	: getFlashcards
	};

}) (VISH, jQuery);

