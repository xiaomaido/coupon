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
	$yzm = $('#yzm');
	$phone = $('#phone');
	$pwd = $('#pwd');	
	ex = '网络不好，请稍后再试！';
	s = 'sent';
	l = '立即登录';
	verifyMobilePhone = -1;
	seconds = 60;
	jumpUrl = '';
};
p.initCss = function() {
	$out_wrap.css("visibility","visible");
};
p.initEvent = function() {
	$out_wrap.delegate('.j_switch', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		window.location.href = $(this).attr('data-url');
	});
	$out_wrap.delegate('.j_login_btn', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var phone = $.trim($phone.val()) || '',
		pwd =  $.trim($pwd.val()) || '';
		if(!phone){
			$phone.focus();
			return;
		}
		if(!validatePhone(phone)){
			fillAlert('手机号不合规定！');
			return;
		}
		if(!pwd){
			$pwd.focus();
			return;
		}
		if(!validatePwd(pwd)){
			fillAlert('密码长度需4-20位！');
			return;
		}
		if(location.pathname.indexOf('signin')>-1){
			btnText($j_login_btn,'正在登录...',0);
			logIn(phone,pwd);
		}
		else{
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
				btnText($j_login_btn,'正在验证...',0);
				verifiedMobile(smscode);
			}
			else{
				btnText($j_login_btn,'正在注册...',0);
				signUp(phone,pwd);
			}
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
	$j_wait_tip.text(s).show();
	setTimeout(function(){
		$j_wait_tip.hide();
	},time);
}
// function btnText(element,s,time){
// 	time = time ? time : (time==0?0:600);
// 	setTimeout(function(){
// 		element.text(s);
// 	},time);
// }
function verifiedMobile(smscode){
	AV.User.verifyMobilePhone(smscode).then(function(data) {
	  verifyMobilePhone = 1;
	  if(document.referrer.indexOf('/shop/')>-1){
	  	jumpUrl=document.referrer;
	  }
	  waitRedirect(jumpUrl,1000);
	}, function(error) {
	  	fillAlert(errorEnum[error.code]['msg']);
		btnText($j_login_btn,'验证手机号');
	});
}
function sendSMSAgain(mobile){
	AV.User.requestMobilePhoneVerify(mobile).then(function(data) {
	   showSMSInput();
	}, function(error) {
	    $j_login_btn.html(l);
	  	fillAlert(errorEnum[error.code]['msg']);
	});
}

function logIn(userName,userPwd,url){
	jumpUrl = url || '../../mobile/index/';
	AV.User.logIn(userName, userPwd, {
	  	success: function(user) {
	    	if(user && user.id  && user.get('userRole') == 'User'){
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
	    		$j_login_btn.html(l);
	    	}
	  	},
	  	error: function(user, error) {
	  		fillAlert(errorEnum[error.code]['msg']);
			btnText($j_login_btn,l);
	  	}
	});
}
function signUp(userName,userPwd,url){
	jumpUrl = url || '../../mobile/index/';
	var user = new AV.User();
	user.setMobilePhoneNumber(userName);
	user.set('username', userName);
	user.set('password', userPwd);
	user.set('pwd', userPwd);
	user.set('userRole', 'User');
	user.signUp().then(function(data) {
		showSMSInput();
		var Users = AV.Object.extend('Users');
        var u = new Users();
        u.set('username', userName);
        u.set('mobile',userName);
        u.set('pid',data.id);
        // u.save();
        u.save(null, {
          success: function(data) {
          	// debugger
          },
          error: function(data, error) {
          	// debugger
          }
        });
	}, function(error) {
		// debugger
		btnText($j_login_btn,'立即注册');
	  	fillAlert(errorEnum[error.code]['msg']);
	});
}
function showSMSInput(){
	$('.hide').show();
	timeCount();
	verifyMobilePhone = 0;
	btnText($j_login_btn,'验证手机号');
}
function timeCount(){
	$j_sms.html(seconds+' s');
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

function validatePhone(phone){
	if (phone.indexOf('86') != 0) {
		phone = '86' + phone;
	}
	return reg.test(phone);
}
function validatePwd(pwd){
	return pwd.length>=4 && pwd.length<=20;
}