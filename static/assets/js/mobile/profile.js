var p = {
	'classname':'',
	'valued':'valued'
};
p.init = function() {
	user.checkLogin(p.initData);
	p.initEvent();
};
p.initCss = function() {
	menuHtml('shop1','mee');
	$out_wrap.css("visibility","visible");
};
p.initEvent = function(){
	$('.sex').change(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);
		if(!!$this.val()){
			$this.addClass(p.valued);
		}
		else{
			$this.removeClass(p.valued);
		}
	});
	$('.save-btn').on('click',function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $this = $(this),
		params = {
			'mobile': $('.mobile').val(),
			'location': $('.location').val(),
			'nickname': $('.nickname').val(),
			'sex': $('.sex').val()
		};
		var query = new AV.Query('Users');
		query.get(p.id,{
		  success: function(u) {
		  	for(var i in params){
		  		u.set(i,params[i]);
		  	}
		  	u.save();
		  	$this.html('保存成功');
			btnText($this,'保存');

		  },
		  error: function(){
		  	$this.html('保存失败');
			btnText($this,'保存');
		  }
		}); 
	});
};
p.initData = function(){
	p.initCss();
	$out_wrap.find('.mobile').val(user.userInfo.get('mobile'));
	$out_wrap.find('.nickname').val(user.userInfo.get('nickname'));
	$out_wrap.find('.location').val(user.userInfo.get('location'));
	var sex = user.userInfo.get('sex');
	if(sex){
		$out_wrap.find('.sex').val(sex).addClass(p.valued);
	}
	p.id = user.userInfo.id;
};