VISH.Editor.Tools.Menu = (function(V,$,undefined){

	/**
	* Menu item classes:
	* menu_all : Always visible
	* menu_standard_presentation: 	Visible for standard presentations
	* menu_presentation: 			Visible for presentations
	* menu_flaschard: 				Visible for flashcards
	* menu_game: 					Visible for games
	*/

	var init = function(){

		var presentation = VISH.Editor.getExcursion();
		if(!presentation){
			//Case: New presentation with type 'presentation'
			presentation = new Object();
			presentation.type = "presentation";
		}

		$("ul.menu_option_main").find("li").hide();
		$("ul.menu_option_main").find("a.menu_all").parent().show();

		switch(presentation.type){
			case "presentation":
				$("ul.menu_option_main").find("a.menu_presentation").parent().show();

				// if(standard){
					$("ul.menu_option_main").find("a.menu_standard_presentation").parent().show();
				// }

				break;
			case "flashcard":
				$("ul.menu_option_main").find("a.menu_flashcard").parent().show();
				break;
			case "game":
				$("ul.menu_option_main").find("a.menu_game").parent().show();
				break;
			case "quiz_simple":
				break;
			default:
				break;
		}

		//Check for single elements and death menus
		var menus = $("ul.menu_option_main").find("ul");
		$.each($(menus), function(index, menu) {
			var lis = $(menu).find("li");
			var visibleLis = 0;
			var lastVisibleLi = null;

			$.each($(lis), function(index, li) {
				if($(li).css("display")!="none"){
					visibleLis = visibleLis+1;
					lastVisibleLi = li;
				}
			});
			
			if(visibleLis==0){
				//No elements... hide ul?
				//Unknown use case...
			} else if(visibleLis==1){
				//Add special class for single elements
				$(lastVisibleLi).find("a").addClass("menu_single_element");
			}

			visibleLis = 0;
		});


		//Add listeners to menu buttons
		$.each($("#menu a.menu_action"), function(index, menuButton) {
			$(menuButton).on("click", function(event){
				event.preventDefault();
				if(typeof VISH.Editor.Tools.Menu[$(menuButton).attr("action")] == "function"){
					VISH.Editor.Tools.Menu[$(menuButton).attr("action")](this);
				}
			});
		});
	}
  

	var settings = function(){
		V.Debugging.log("Settings called");

		$.fancybox(
			$("#excursiondetails").html(),
			{
				'autoDimensions'	: false,
				'width': 800,
				'height': 660,
				'scrolling': 'no',
				'showCloseButton'	: true,
				'padding' 			: 0,
				'onClosed'			: function(){
				}
			}
		);
	}


	return {
		init							: init,
		settings						: settings
	};

}) (VISH, jQuery);