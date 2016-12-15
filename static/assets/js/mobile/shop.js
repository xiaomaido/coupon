var p = {
	'classname':'Shops',
	'classname2':'Coupons',
	'classname3':'CouponLog'
};
p.init = function() {
	p.initVar();
	p.initEvent();
	menuHtml('shop','mee1');
	// user.checkLogin(p.initData);
	p.initData();
};
p.initVar = function() {
	p.logObj = {};
	enabled = false;
	reloadCouponList = false;
	shop = {};
	chains = {};
	coupons = [];
	shop.pid = misc.getParam('pid') || '';
	$body = $('body');
	$j_shop_menu = $out_wrap.find('.j_shop_menu');
	$j_tab = $out_wrap.find('.j_tab');
	$j_big_verify = $('.j_big_verify');
	couponLog = {};
};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};
p.initEvent = function() {
	$j_shop_menu.delegate('li', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var a = 'active',
		$this = $(this);
		$this.closest('ul').find('span').removeClass(a);
		$this.find('span').addClass(a);
		$j_tab.hide();
		$j_tab.eq($this.index()).show();
	});
	$body.delegate('.j_dialog', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(!user.currentUser){
			redirect('../signup/');
		}
		var $this = $(this);
		var id = $this.attr('data-id');
		couponLog = {};
		if(!!id){
			if(p.logObj[id] >= parseInt($this.attr("data-times"))){
				return false;
			}
			enabled = true;
			couponLog = {
				'isDeleted':0,
				'isVip':$this.attr('data-vip'),
				'couponContent':$this.attr('data-content'),
				'couponName':$this.attr('data-name'),
				'couponType':$this.attr("data-type"),
				'couponImg':$this.attr("data-img"),
				'couponId': id,
				'shopId': shop.pid,
				'shopLogo': shop.get('logo'),
				'shopName': shop.get('name'),
				'userId': user.currentUser.id,
				'username': user.currentUser.get('username'),
				'mobile': user.currentUser.get('mobilePhoneNumber')
			};
			$j_big_verify.html([
				// '<img class="circleShape big-avatar j_big_avatar" src="',logoImg,'">',
				'<div class="icon big-avatar j_big_avatar" style="background-image: url(',couponLog.couponImg,');"></div>',
				'<div class="big-user-name j_big_uname">【',couponLog.couponType,'】',couponLog.couponName,'</div>',
				'<input class="big-user-input" type="password" id="code" value="" placeholder="请店员输入验证口令" />',
				'<div class="btn j_confirm_btn">验证</div>'].join(''));
		}
		dialogShowOrNot($this.attr('data-value'));
		if(reloadCouponList){
			p.loadCouponLog(p.loadShopCoupons);
		}
	});
	$body.delegate('.j_confirm_btn', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $code = $('#code'),
		temp = $code.val(),
		$this = $(this);
		temp = $.trim(temp);
		if(!!temp && enabled){
			enabled = false;
			couponLog['shopChain'] = temp;
			temp = '<no>'+temp+'</no>';
			if(shop.get('chains').indexOf(temp)>-1){
			// if(shop.get('chains').includes(temp)){
				couponLog['shopChainName'] = chains[couponLog['shopChain']].name;
				$this.html('验证中...');
				var Log = AV.Object.extend(p['classname3']);
		        var l = new Log();
		        for(var i in couponLog){
		        	l.set(i,couponLog[i]);
		        }
		        l.save().then(function(){
		        	var q = new AV.Query(p['classname2']);
					q.get(couponLog['couponId'],{
				  		success: function(d) {
							if(d){
								d.increment("nums");
								d.save();
								reloadCouponList = true;
								$this.html('优惠券使用成功');
								$('title').html(['【券宝·',couponLog.shopName,'·',couponLog.couponType,'】',couponLog. couponName].join(''));
							}
						}
					});
		        }, function(){
					$this.html('优惠券使用失败');
					btnText($this,'验证');
		        });
			}
			else{
				enabled = true;
				$this.html('口令不正确');
				btnText($this,'验证');
			}
		}
	});
};
p.initData = function(){
	p.initCss();
	p.loadShop();
	if(user.currentUser){
		p.loadCouponLog(p.loadShopCoupons);
	}else{
		p.loadShopCoupons();
	}
};
p.loadShop = function() {
	var query = new AV.Query(p['classname']);
	query.equalTo("pid",shop.pid);
	query.find({
		success: function(datas) {
			shop = datas[0];
			shop.pid = shop.get('pid');
			// console.log(shop);
			if(shop && shop.id){
				$('title').html('【券宝 & '+shop.get('name')+'】'+shop.get('addr'));
				$out_wrap.find('.j_shop_img').attr('data-echo-background',shop.attributes['img0']);
				$out_wrap.find('.j_shop_slogan').html(shop.get('slogan'));
				$out_wrap.find('.shop-name').html('【'+shop.get('name')+'】'+shop.get('addr'));
				// $out_wrap.find('.shop-name').html(shop.get('name'));
				// $out_wrap.find('.shop-addr').html('【'+shop.get('addr')+'】');
				$out_wrap.find('.tags').html(p.loadTags());
				// $j_tab.eq(1).html(shop.get('chains'));
				// $j_tab.eq(2).html(shop.get('bulletin'));
				
				var $chain_el=$j_tab.eq(2);
				$chain_el.html(shop.get('chains'));

				var $chains_no = $chain_el.find('no'),
					$chains_p = $chain_el.find('p'),
					$chains_div = $chain_el.find('div');
				for (var i = 0,l = $chains_no.length;i < l; i++) {
					var no = $chains_no.eq(i).html();
					chains[no] = {
						'no':no,
						'name':$chains_p.eq(i).html()
					};
				}
				echo.init({
				    offset: 300, 
				    throttle: 0 
				});
		  	}
		  	else{

		  	}
	   	},
	    error: function(data) {
	    }
	}); 
};
p.loadTags = function(){
	var arr = [],
	tags = shop.get('tags').split(' ');
	for (var i = 0,l = tags.length; i < l; i++) {
		arr.push('<span>'+tags[i]+'</span>');
	}
	return arr.join('');
};
p.loadCouponLog = function(callback){
	p.logObj = {};
	var query = new AV.Query(p['classname3']);
	query.equalTo('userId',user.currentUser.id);
	query.equalTo('shopId',shop.pid);
	query.notEqualTo("isDeleted",1);
	query.limit(1000);
	query.find({
	  success: function(datas) {
	  	var l = datas.length;
	  	for (var i = 0; i < l; i++) {
	  		var couponId = datas[i].get('couponId');
	  		if(p.logObj.hasOwnProperty(couponId)){
	  			p.logObj[couponId] += 1;
	  		}
	  		else{
	  			p.logObj[couponId] = 1;
	  		}
	  	};
	  	callback && callback();
	  },
	  error: function(){
	  	callback && callback();
	  }
	});
};
p.loadShopCoupons = function() {
	var query = new AV.Query(p['classname2']);
	query.equalTo("shopId",shop.pid);
	query.equalTo('isShow',"1");
	query.greaterThanOrEqualTo("endDatetime", new Date());
	query.lessThanOrEqualTo("beginDatetime", new Date());
	query.ascending("sort");
	query.find({
		success: function(datas) {
			coupons = datas;
			var arrHtml=[],arrHtml2=[];
			l = datas.length;
			for (var i = 0; i < l; i++) {
				var d=datas[i];
				// if(d.get("vips")[0]!="0"){
				if(d.get("vips")[0]!="0" && d.get("vips").join("-").indexOf(user.currentUser.get("username"))>=0){
					arrHtml2.push(couponHtml(i,d,d.get("vips").join("-").indexOf(user.currentUser.get("username"))));
				}
				else if(d.get("vips")[0]=="0")
					arrHtml.push(couponHtml(i,d,-2));
			}
			if(arrHtml.length==0){
				arrHtml = ['<li style="text-align: center;line-height:6rem;">暂无优惠券</li>'];
			}
			if(arrHtml2.length==0){
				arrHtml2 = ['<li style="text-align: center;line-height:6rem;">暂无福利券</li>'];
			}
			$j_tab.eq(0).html(arrHtml.join(''));
			$j_tab.eq(1).html(arrHtml2.join(''));
			loadingHide();
			echo.init({
			    offset: 30, 
			    throttle: 0 
			});
	   	},
	    error: function(data) {
			loadingHide();
	    }
	});
};
function couponHtml(idx,obj,res){
	var flag = obj.get("times") - (p.logObj[obj.id] || 0);
	flag = flag > 0 ? flag : 0;
	flag = res==-1 ? 0:flag;
	return ['<li>',
				'<div class="couponarea j_view">',
					flag ? '<div class="remain-num">'+flag+'</div>':'',
					'<div class="icon coupon-img" data-echo-background="',obj.get("couponImg"),'" style="background-image: url(',logoImg,');"></div>',
					// '<img class="coupon-img" data-src="',defaultImg,'" src="',logoImg,'">',
					'<div class="coupon-info">',
						'<div class="objname">【',obj.get("type"),'】',obj.get("name"),'</div>',
						'<div class="usersepcial">有效期：',misc.formatDateTime(obj.get('beginDatetime'),misc.formatType['1']),' 至 ',misc.formatDateTime(obj.get('endDatetime'),misc.formatType['1']),'</div>',
						'<div data-img="',obj.get("couponImg")||logoImg,'" data-vip="',obj.get("vips")[0],'" data-times="',obj.get("times"),'" data-id="',obj.id,'" data-type="',obj.get("type"),'" data-name="',obj.get("name"),'" data-content="',obj.get("content"),'" data-value="none" class="',(flag ? "j_dialog":"no-coupon"),' coupont-btn',(idx%2==0?"":"2"),'">',(flag ? "立即使用":"无可用券"),'</div>',
					'</div>',
				'</div>',
				'<div class="thinner-border"></div>',
			'</li>'].join('');
}