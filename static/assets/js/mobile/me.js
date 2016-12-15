var p = {
	'classname':''
};
p.init = function() {
	menuHtml('shop1','mee');
	user.checkLogin(p.initCss);
};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};