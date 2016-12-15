var p = {
	'classname':'CouponLog',
	'size':20,
	'page':0
};
p.init = function() {
	user.checkLogin(p.initData);
	p.initVar();
	menuHtml('shop1','mee');
};
p.initVar = function() {
	couponLogs = [];
};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};
p.initData = function(){
	p.initCss();
	p.loadCouponLog();
};
p.loadCouponLog = function(){
	var query = new AV.Query(p['classname']);
	// query.ascending("createdAt");
	query.descending("createdAt");
	query.limit(p['size']);
	query.skip(p['page']*p['size']);
	query.equalTo('userId',user.currentUser.id);
	query.notEqualTo("isDeleted",1);
	query.find({
	  success: function(datas) {
	  	couponLogs = datas;
	  	var arrHtml = [],
	  		l = couponLogs.length;
	  	for (var i = 0; i < l; i++) {
	  		arrHtml.push(logHtml(couponLogs[i]));
	  	};
	  	if(arrHtml.length>0){
	  		$('.logs').html(arrHtml.join(''));
	  	}
		// var h = document.documentElement.scrollHeight || document.body.scrollHeight;
		// window.scrollTo(h,h);
		loadingHide();
		echo.init({
		    offset: 100, 
		    throttle: 0 
		});
	  }
	});
};
function logHtml(obj){
	return [
		'<li class="log">',
			'<div class="create">',misc.formatDateTime(obj.createdAt,misc.formatType['2']),'</div>',
			'<div class="info">',
				'<div class="title">已使用优惠券详情</div>',
				'<div class="chain">',obj.get('shopChainName'),'</div>',
				'<div class="name">[',obj.get('couponType'),'] ',obj.get('couponName'),'</div>',
				// '<div class="" style="width: 4.5rem; height: 4.5rem; position: absolute; right: 56%; background-image: url(&quot;',defaultImg,'&quot;); background-size: cover; background-position: 50% 50%; background-repeat: no-repeat;border-radius: 50%;-moz-border-radius: 50%;-webkit-border-radius: 50%;" data-echo-background="../../static/assets/images/mobile/coupon/5.png"></div>',
				'<div class="" style="width: 4.5rem; height: 4.5rem; position: absolute; right: 56%; background-image: url(&quot;',defaultImg,'&quot;); background-size: cover; background-position: 50% 50%; background-repeat: no-repeat;" data-echo-background="../../static/assets/images/mobile/coupon/5.png"></div>',
				'<div class="" style="width: 4.5rem; height: 4.5rem; position: absolute; left: 56%; background-image: url(&quot;',defaultImg,'&quot;); background-size: cover; background-position: 50% 50%; background-repeat: no-repeat;" data-echo-background="',obj.get('shopLogo'),'"></div>',
			'</div>',
		'</li>'
	].join('');
}