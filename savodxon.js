globalURL = "https://savodxon.uz/";

(function() {
    tinymce.PluginManager.add( 'savodxon_class', function( editor, url ) {
        // Add Button to Visual Editor Toolbar
		editor.settings.browser_spellcheck = false;
        editor.addButton('savodxon_check_class', {
            title: 'Imloni tekshirish',
            cmd: 'savodxon_check_class',
            image: url + '/check.png',
        });
		editor.addButton('savodxon_clear_class', {
            title: 'Ostiga chizishni bekor qilish',
            cmd: 'savodxon_clear_class',
            image: url + '/clear.png',
        });
		
		editor.addCommand('savodxon_clear_class', function() {
			var html = editor.getContent({'format': 'html'});
			var html = html.replace(/<span class=\"error\">([^<]+)<\/span>/g, "$1");
			editor.setContent(html);
		 });
        // Add Command when Button Clicked
        editor.addCommand('savodxon_check_class', function() {
			var html = editor.getContent({'format': 'html'});
			var html = html.replace(/<span class=\"error\">([^<]+)<\/span>/g, "$1");
			
			var html = autocorrectTree(html);
			
			editor.setContent(html);
			
            var text = editor.getContent({'format': 'text'});
			
			var text = remModifiers(text);
			var text = autoCorrect(text);
			
			var correctWords = [];
			
			if ( localStorage["myDict"] ) {
				var myDict = JSON.parse( localStorage["myDict"] );
			} else {
				var myDict = [];
			}
			
			var wArray2 = [];
			var wArray = text.split(/[^a-zA-Zʻʼ\'\-]+/g);
			var wArray = wArray.filter(function(x) {
				return x !== undefined && x != null && x != '';
			});
			wArray.forEach(function(el){
				if (wArray2.indexOf(el) == -1 && myDict.indexOf(el) == -1){
					if (el != el.toUpperCase() && el.length < 50) {
						wArray2.push(el);
					}
				}
			});
			
			if(text.length > 0) {
				if(wArray2.length > 0) {
					var text = JSON.stringify(wArray2);
					var savodxonApiKey = getApiKey();
					var data = "apikey=" + savodxonApiKey + "&text="+text;
					if(savodxonApiKey != false){
						jQuery.ajax({
							type: "POST",
							url: globalURL+"api/check",
							data: data,
							cache: false,
							success: function(response){
								//console.log(response);					
								if (response.success) {
									if (response.errors) {
										words = response.words;
										var incorectWords = response.words;
										wArray2.forEach(function(el){
											if (incorectWords.indexOf(el) == -1){
												correctWords.push(el);
											}
										});
										correctWords.forEach(function(el){
											if (myDict.indexOf(el) == -1){
												myDict.push(el);
											}
										});
										localStorage["myDict"] = JSON.
										
										stringify(myDict);
										
										var html = editor.getContent({'format': 'html'});

										words.forEach(function(word){
											var regx = /^(ku|yu|da|ya|chi)$/;
											if (!regx.test(word)) {
												var wrapped = "\(^\|[^a-zA-Zʼʻ]\)\("+word+"\)\([^a-zA-Zʼʻ]\|$\)";
												var pat = new RegExp(wrapped, "g");
												html = html.replace(pat, "$1<span class='error'>$2</span>$3");
											}
										});
										
										editor.setContent(html);
									} else {
										wArray2.forEach(function(el){
											if (myDict.indexOf(el) == -1){
												myDict.push(el);
											}
										});
										localStorage["myDict"] = JSON.stringify(myDict);
									}
								}
							},
							error: function(response){
								console.log('Matnni tekshirishda texnik xato yuz berdi');
							}
						});
					} else {
						console.log('API kalitni topib bo‘lmadi');
					}
				} else {
					console.log('Kiritilgan matnda xatolar topilmadi');
				}
			} else {
				console.log('Iltimos, tekshirish uchun kamida bitta so‘z kiriting');
			}
        });
    });
})();

autocorrectTree = function(html) {
	var tmpElem = $('<div>');
	tmpElem.css({display: "none"});
	tmpElem.attr({id: "savodxonTempDiv"});
	tmpElem.html(html);
	$("body").append(tmpElem);
	var main = document.getElementById("savodxonTempDiv");
	var allNodes = main.getElementsByTagName("*");
	for (var key in allNodes) {
		var el = allNodes[key];			
		if (el.nodeName !== 'SCRIPT' && el.nodeName !== 'STYLE' && el.nodeName !== 'PRE'){
			var children = el.childNodes;
			if (children !== undefined){
				x = children.length; 
				for (i=0; i<x; i++){
					if (children[i].nodeType == 3 && children[i].nodeValue !== "\n"){
						text  = children[i].nodeValue;
						children[i].nodeValue = autoCorrect(text);
					}
				}
			}
		}
	}
	var output = tmpElem.html();
	tmpElem.remove();
	return output;
};

autoCorrect = function(text){
	var text = text.replace(/ʻ|‘|’|'|`/g,"ʼ");
	var text = text.replace(/([GOgo])ʼ/g,"$1ʻ");
	var text = text.replace(/«|"([^»])/g, '“$1');
	var text = text.replace(/([^"])"|»/g, '$1”');
	return text;
};

remModifiers = function(text){
	var text = text.replace(/\b[A-Z]+[a-z]+[A-Z]+[a-z]{0,}\b|\b[A-Z]{2,}[a-z]{0,}\b/g,"");
	var text = text.replace(/([aouei]g|[aouei]gʻ)\-(a|u)\b/g,"$1г$2");
	var text = text.replace(/\-(a|ku|yu|u|da|ya|chi)\b/g,"");
	var text = text.replace(/\-/g," ");
	var text = text.replace(/г/g,"-");
	var text = text.replace(/\b(Sh|Ch|Yu|Yo|Ya|Ye)\./g,"");
	var text = text.replace(/([^a-zA-Z\-ʻʼ])u\b/g,"$1");
	var text = text.replace(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ig, "");
	var text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig, "");
	return text;
};

getApiKey = function(){
	if ( localStorage["savodxonApiKey"] ) {
		var savodxonApiKey = JSON.parse( localStorage["savodxonApiKey"] );
	} else {
		jQuery.ajax({
			type: "POST",
			url: globalURL+"api/getapi",
			cache: false,
			assync: false,
			success: function(response){
				//console.log(response);					
				if (response.success) {
					var savodxonApiKey = response.apiKey;
					//console.log(apiKey);
					localStorage["savodxonApiKey"] = JSON.stringify(savodxonApiKey);
				} else {
					var savodxonApiKey = false;
				}
			},
			error: function(response){
				//console.log(response);
				var savodxonApiKey = false;
			}
		});
	}
	return savodxonApiKey;
};
