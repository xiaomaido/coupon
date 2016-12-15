var p = {
	'classname':'Shops'
};
p.init = function() {
	p.initVar();
	p.initCss();
	p.initEvent();
	p.loadDatas();
};
p.initVar = function() {
	$j_banners = $out_wrap.find('.j_banners');
	$j_shops = $out_wrap.find('.j_shops');
	$j_loadmore = $out_wrap.find('.j_loadmore');
	banners = [
	{
		'img': 'gongAD',
		'link': 'https://mp.weixin.qq.com/s?__biz=MjM5MzU3MTA1NA==&mid=2653108734&idx=1&sn=4559698c0d0c0236c2557742a485250f&scene=1&srcid=0824TT8NgemrGUjBH8gk3REF&key=cf237d7ae24775e86a352ba76c37cf590b880506cdf920e00576d2252161a5e5ed0533afb68528394cd3c42f20b21c69&ascene=0&uin=MjgwNzc0MDk1&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.10.5+build(14F1909)&version=11020201&pass_ticket=FUNKFbOskYv2Kfi%2FI9%2FrsV7U27%2BKIEllnB6jIW9ChlvI%2BxTV2PxmxwkC7kPsA0wb'
	}
	// ,
	// {
	//  	'img': 'redAD',
	//  	'link': '../red/'
	// }
	// ,
	// {
	//  	'img': 'smzdmAD',
	//  	'link': '../smzdm/'
	// }
	
	// ,{
	//  	'img': 'gonggaoAD',
	//  	'link': 'javascript:;'
	//  }
	];
	page = 0;
	size = 8;
};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};
p.initEvent = function() {
	$j_shops.delegate('li', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		window.location.href = ['../shop/?pid=',$(this).attr('data-pid')].join('');
	});
};
p.loadDatas = function() {
	menuHtml('shop','mee1');
	p.loadBanners();
	p.loadShops();
};
p.loadBanners = function() {
	var arr = [];
	for (var i = banners.length-1 ; i >= 0 ; i--) {
		arr.push(['<li><a class="pic" href="',banners[i].link,'"><img class="j_picture" data-src="',defaultImg,'" src="',imgpath,'banner/',banners[i].img,'.jpg" alt=""></a></li>'].join(''));
	};
	$j_banners.html(arr.join(''));
	if(banners.length>1){
		// 左右滑动轮播
		TouchSlide({ 
			slideCell: "#slideBox",
			titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
			mainCell:".bd ul", 
			effect:"leftLoop", 
			autoPage:true, //自动分页
			autoPlay:true, //自动播放
			delayTime: 500,
			interTime: 6000,
		});
	}
	else{
		$('.hd').hide();
	}
};
p.loadShops = function() {
	var query = new AV.Query(p['classname']);
    query.ascending("sort");
	query.equalTo('accountStatus',"1");
	query.notEqualTo('sort',0);
    query.limit(size);
    query.skip(page*size);
	query.find({
		success: function(datas) {
			// console.log(datas);
			var l=datas.length;
			if(l>0){
				var arrHtml = [];
				for (var i=0; i<l; i++) {
					arrHtml.push(shopHtml(datas[i],i+1,l));
				};
				$j_shops.append(arrHtml.join(''));
				page++;
				if(l<size){
		  			$j_loadmore.off().empty();
		  			// $j_loadmore.off().html('已加载完所有数据');
		  			// setTimeout(function(){
		  			// 	$j_loadmore.hide();
		  			// },1500);
				}
		  	}
		  	else{
		  		$j_loadmore.off().html('已加载完所有商户');
		  	}

			echo.init({
			    offset: 300, 
			    throttle: 0 
			});
	   	},
	    error: function(user, error) {
	    	$j_loadmore.off().html('服务器网络数据不给力哦');
	    }
	}); 
};
function shopHtml(shop){
	return [
		'<li class="thinner-border" data-pid="',shop.get("pid"),'" >',
			'<div class="userarea j_view">',
				// '<img class="avatar" src="',shop.get("logo"),'">',
				'<div class="" style="width: 5.35rem;height: 4.5rem;position: absolute;:;background-repeat: no-repeat;/*border: 1px solid #d8d8d8;*/float: left;background-image: url(',defaultImg,');background-position: center;background-size: contain;" data-echo-background="',shop.get("logo"),'"></div>',
				'<div class="userinfo">',
					'<div class="objname">',shop.get("name"),'</div>',
					'<div class="usersepcial">【',shop.get("addr"),'】',shop.get("slogan"),'</div>',
					// '<div class="usersepcial">[',shop.get("addr"),'] ',shop.get("slogan"),'</div>',
					'<ul class="usertags">',getTagHtml(shop.get('tags')),'</ul>',
				'</div>',
				'<div class="follow j_follow">查看优惠券</div>',
			'</div>',
		'</li>'
	].join('');
}
function getTagHtml(tag){
  var arr = [],tagArr = [];
  if(tag){
    tag = tag.replace(/，/g," ");
    tag = tag.replace(/、/g," ");
    tag = tag.replace(/,/g," ");
    tagArr = tag.split(" ");
    if(tagArr.length > 5){
      tagArr.length = 5;
    }
    arr.push('<li><img src="',imgpath,'tag.png" class="desc-tag-img"></li>');
    for (var i = 0,l = tagArr.length; i < l; i++) {
      arr.push('<li>',tagArr[i],'</li>');
    };
  }
  return arr.join('');
}
//获取滚动条当前的位置 
function getScrollTop() { 
	var scrollTop = 0; 
    if (document.documentElement && document.documentElement.scrollTop) { 
    	scrollTop = document.documentElement.scrollTop; 
    } 
    else if (document.body) { 
    	scrollTop = document.body.scrollTop; 
    } 
    return scrollTop; 
} 

//获取当前可是范围的高度 
function getClientHeight() { 
	var clientHeight = 0; 
    if (document.body.clientHeight && document.documentElement.clientHeight) { 
   		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight); 
    } 
    else { 
    	clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight); 
    } 
    return clientHeight; 
}

//获取文档完整的高度 
function getScrollHeight() { 
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); 
} 
window.onscroll = function () { 
	if (getScrollTop() + getClientHeight() == getScrollHeight()) { 
		p.loadShops();
	} 
}; 