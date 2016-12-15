var p = {
	'classname':'Users'
};
p.init = function() {
	p.initVar();
	p.initCss();
	p.initEvent();
};
p.initVar = function() {
	$j_login_btn = $out_wrap.find('.j_login_btn');
	$j_wait_tip = $out_wrap.find('.j_wait_tip');
	$j_sms = $out_wrap.find('.j_sms');
	$username = $('#username');
	$yzm = $('#yzm');
	req = {};
	ex = '网络异常，请稍后再试！';
	d = 'disabled';
	s = 'sent';
	verifyMobilePhone = -1;
	seconds = 60;
	jumpUrl = '';

};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};
p.initEvent = function() {
	$out_wrap.delegate('#username','input', function(){
		validyPhoneNumber($(this).val());
	});
	$out_wrap.delegate('.j_login_btn', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(verifyMobilePhone == 0 ){
			var smscode = $.trim($yzm.val());
			if(!smscode){
				$yzm.focus();
				return false;
			}
			if(smscode.length != 6){
				fillAlert('请输入6位数字验证码！');
				return false;
			}
			$j_login_btn.html('正在验证手机号...');
			verifiedMobile(smscode);
		}
		else{
			var temp = $.trim($username.val());
			if(!temp){
				$username.focus();
				return false;
			}
			if($j_login_btn.hasClass(d)){
				fillAlert('请输入正确的手机号！');
				return false;
			}
			$j_login_btn.html('正在登录...');

			signUpOrlogIn(temp,'123456');
		}
	});
	$out_wrap.delegate('.j_sms', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);
		if($this.hasClass(s)){
			seconds = 60;
			sendSMSAgain($.trim($username.val()));
		}
	});
};

function fillAlert(s,time){
	time = time ? time : 600;
	$j_wait_tip.html(s).show();
	setTimeout(function(){
		$j_wait_tip.hide();
	},time);
}
function verifiedMobile(mobile){
	AV.User.verifyMobilePhone(mobile).then(function(data) {
	  verifyMobilePhone = 1;
	  waitRedirect(jumpUrl,1000);
	}, function(data) {
		fillAlert(ex);
	});
}
function sendSMSAgain(mobile){
	AV.User.requestMobilePhoneVerify(mobile).then(function(data) {
	   showSMSInput();
	}, function(data) {
	    $j_login_btn.html('登录');
		fillAlert(ex);
	});
}
function signUpOrlogIn(userName,userPwd,url){
	jumpUrl = url || '../../mobile/index/';
	AV.User.logIn(userName, userPwd, {
	  	success: function(user) {
	    	if(user && user.id  && user.get('userRole') == 'User'){
	    		debugger
	    		if(user.get('mobilePhoneVerified')){
	    			fillAlert('登录成功!');
					waitRedirect(jumpUrl,1000);
	    		}
	    		else {
	    			sendSMSAgain(userName);
	    		}
	    	}
	    	else{
	    		AV.User.logOut();
	    		fillAlert('账号登录异常!');
	    		$j_login_btn.html('登录');
	    	}
	  	},
	  	error: function(user, error) {
	    	if(error.code == '211'){
	  			var user = new AV.User();
				user.setMobilePhoneNumber(userName);
				user.set('username', userName);
				user.set('password', userPwd);
				user.set('userRole', 'User');
				user.signUp().then(function(data) {
	  				showSMSInput();
				}, function(data) {
				    fillAlert(ex);
				});
	  		}
	  		else{
	  			fillAlert(ex);
	  		}
	  	}
	});
}
function showSMSInput(){
	$('.hide').show();
	timeCount();
	verifyMobilePhone = 0;
	$j_login_btn.html('验证并登录');
}
function timeCount(){
	var t = setInterval(function(){
  		seconds--;
		if(seconds >= 0){
			$j_sms.html(seconds+' s');
		}
		else{
			$j_sms.addClass(s).html('重新发送');
			clearInterval(t);
		}
	},1000);
}
function validyPhoneNumber(phone){
	var reg = /^(86)[1][3-8][0-9]{9}$/;
	phone = $.trim(phone) || '';
	if (phone.indexOf('86') != 0) {
		phone = '86' + phone;
	}
	if (reg.test(phone)) {
		$j_login_btn.removeClass(d);
		
	} else{
		$j_login_btn.addClass(d);
	}
	req = {
		'mobile': phone.slice(2)
	};
	$username.val(req.mobile);
}