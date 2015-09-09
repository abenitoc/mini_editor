/* 
 * Enable FullScreen for ViSH Viewer
 */

VISH.FullScreen = (function(V,$,undefined){

	//Native FS params
	var _currentFSElement;
	var _lastFSElement;
	var _lastFSTimestamp;

	//Fullscreen fallback params
	var _pageIsFullScreen;
	var _fallbackFs;
	var _enterFsURL;
	var _exitFsURL;


	var init = function(){
		// If FullScreen native support is not available try to use fallback options
		if((!_canUseNativeFs())&&(_canUseFallbackFs())){
			_fallbackFs = true;
			_initFallback();
		} else {
			_fallbackFs = false;
		}

		_updateFsButtons();
	};

	var _initFallback = function(){
		_pageIsFullScreen = false;

		if(V.Status.getIsInIframe()){
			_enterFsURL = options["fullScreenFallback"]["enterFullscreenURL"];
		} else {
			_exitFsURL = options["fullScreenFallback"]["exitFullscreenURL"];
			_pageIsFullScreen = true;
		}
	};

	var canFullScreen = function(){
		if(!V.Editing){
			//Viewer
			return ((_canUseNativeFs())||(_canUseFallbackFs()));
		} else {
			return ((false)&&(_canUseNativeFs())&&(V.Status.getDevice().features.css3d));
		}
	};

	var _canUseNativeFs = function(){
		return (V.Status.getDevice().features.fullscreen)&&(_getFsEnabled());
	};

	var _canUseFallbackFs = function(){
		// Fallback is not possible in embeds...
		if(V.Status.getIsEmbed()){
			return false;
		}

		if(V.Editing){
			return false;
		}

		var options = V.Utils.getOptions();
		if ((typeof options == "object")&&(typeof options["fullScreenFallback"] == "object")) {
 
			if ((V.Status.getIsInIframe())&&(typeof options["fullScreenFallback"]["enterFullscreenURL"] == "string")){
				return true;
			}

			if(V.Status.getIsInIframe()){
				if (typeof options["fullScreenFallback"]["enterFullscreenURL"] == "string"){
					return true;
				}
			} else {
				if(typeof options["fullScreenFallback"]["exitFullscreenURL"] == "string"){
					return true;
				}
			}
		}

		return false;
	};

	var isFullScreen  = function(){
		if(_fallbackFs===true){
			return _pageIsFullScreen;
		}
		return _isDocumentFullScreen();
	};

	var enableFullScreen = function(){
		if(_canUseNativeFs()){
			_enableNativeFS();
		} else if(_fallbackFs) {
			_enableFallbackFS();
		}
	};

	var _enableNativeFS = function(){
		$(document).on('click', '#page-fullscreen', _toggleFullScreen);
		$(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange",function(event){
			_lastFSElement = _currentFSElement;
			// _currentFSElement = event.target;
			_currentFSElement = _getFsElement(); //Use the HTML5 FS API Wrapper
			_lastFSTimestamp = new Date();

			_updateFsButtons();
		});
	};

	var _enableFallbackFS = function(){
		if((_pageIsFullScreen)&&(typeof _exitFsURL == "string")){
			$(document).on('click', '#page-fullscreen', function(){
				window.location = V.Utils.removeHashFromUrlString(_exitFsURL) + '#' + V.Slides.getCurrentSlideNumber();
			});
		} else if((!_pageIsFullScreen)&&(typeof _enterFsURL == "string")){
			$(document).on('click', '#page-fullscreen', function(){
				V.Utils.sendParentToURL(V.Utils.removeHashFromUrlString(_enterFsURL) + "?orgUrl=" + V.Utils.removeHashFromUrlString(window.parent.location.href) + '#' + V.Slides.getCurrentSlideNumber());
			});
		}
	};

	var _toggleFullScreen = function (){
		if(V.Status.isSlaveMode()){
			return;
		}

		if(_isDocumentFullScreen()){
			_cancelFullscreen();
		} else {
			_launchFullscreenForElement(document.documentElement);
		}
	};

	var exitFromNativeFullScreen = function(){
		if((_canUseNativeFs())&&(_isDocumentFullScreen())){
			_toggleFullScreen();
		}
	};

	var _updateFsButtons = function(){
		if(isFullScreen()){
			_enableFsEnterButon();
		} else {
			_enableFsLeaveButon();
		}
	};

	var _enableFsEnterButon = function(){
		$("#page-fullscreen").removeClass("fsoff").addClass("fson");
	};

	var _enableFsLeaveButon = function(){
		$("#page-fullscreen").removeClass("fson").addClass("fsoff");
	};


	/*
	 * Wrapper for HTML5 FullScreen API. Make it cross-browser
	 */
	 var _isBrowserInFullScreen = function(){
	 	var fsElement = _getFsElement();
		return ((typeof fsElement !== "undefined")&&(fsElement !== null));
	};

	/* To test if the application is in fullscreen */
	var _isDocumentFullScreen = function(){
		return $(_getFsElement()).is("html");
	};

	var isOtherElementInFullScreen = function(){
		return (_isBrowserInFullScreen()&&!_isDocumentFullScreen());
	};

	var getFSParams = function(){
		return {currentFSElement: _currentFSElement, lastFSElement:_lastFSElement, lastFSTimestamp: _lastFSTimestamp };
	};

	var _isElementInFullScreen = function(elem){
		return ((typeof elem !== "undefined")&&(elem !== null)&&(elem===_getFsElement()));
	};

	var _getFsElement = function(){
		return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	};

	var _getFsEnabled = function(){
		return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
	};

	var _launchFullscreenForElement = function(element){
		if(element.requestFullscreen) {
			element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			setTimeout(function(){
				if (!document.webkitCurrentFullScreenElement){
					// Element.ALLOW_KEYBOARD_INPUT does not work, document is not in full screen mode
					//Fix known Safari bug
					element.webkitRequestFullScreen();
				}
			},250);
		} else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	};

	var _cancelFullscreen = function() {
		_cancelFullscreenForElement(document)
	};

	var _cancelFullscreenForElement = function(elem) {
		if(elem.exitFullscreen) {
			elem.exitFullscreen();
		} else if(elem.cancelFullScreen) {
			elem.cancelFullScreen();
		} else if(elem.mozCancelFullScreen) {
			elem.mozCancelFullScreen();
		} else if(elem.webkitExitFullscreen) {
			elem.webkitExitFullscreen();
		} else if (elem.webkitCancelFullScreen) {
			elem.webkitCancelFullScreen();
		} else if(elem.msExitFullscreen) {
			elem.msExitFullscreen();
		}
	};

	/* Check full screen support */
	var isFullScreenSupported = function(){
		var elem = document.createElement('div');
		if(elem && (elem.requestFullScreen || elem.mozRequestFullScreen || elem.webkitRequestFullScreen || elem.msRequestFullscreen)){
			return true;
		} else {
			return false;
		}
	};

	return {
		init							: init,
		isFullScreenSupported			: isFullScreenSupported,
		canFullScreen 					: canFullScreen,
		enableFullScreen				: enableFullScreen,
		isFullScreen 					: isFullScreen,
		isOtherElementInFullScreen		: isOtherElementInFullScreen,
		getFSParams						: getFSParams,
		exitFromNativeFullScreen		: exitFromNativeFullScreen
	};
    
}) (VISH, jQuery);