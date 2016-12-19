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
		if($j_login_btn.hasClass('disable')) return false;
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
		var smscode = $.trim($yzm.val());
		if(!smscode){
			$yzm.focus();
			return false;
		}
		if(smscode.length != 6){
			fillAlert('请输入6位数字验证码！');
			return false;
		}
		$j_login_btn.addClass('disable');
		btnText($j_login_btn,'正在验证...',0);
		resetPwdBySmsCode(smscode,pwd);
	});
	$out_wrap.delegate('.j_sms', 'click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $this = $(this);
		if($this.hasClass('disable')) return;
		var phone = $.trim($phone.val()) || '';
		if(!phone){
			$phone.focus();
			return;
		}
		if(!validatePhone(phone)){
			fillAlert('手机号不合规定！');
			return;
		}
		$j_sms.html('发送中...').addClass('disable');
		resetPwdByMobilde(phone,function(){
			debugger
			timeCount();
			verifyMobilePhone = 0;
		});
	});
};

function fillAlert(s,time){
	time = time ? time : 600;
	$j_wait_tip.text(s).show();
	setTimeout(function(){
		$j_wait_tip.hide();
	},time);
}
function resetPwdByMobilde(mobile,cb){
	AV.User.requestPasswordResetBySmsCode(mobile).then(function(data) {
		cb&&cb();
	}, function (error) {
	  	fillAlert(errorEnum[error.code]['msg']);
	});
}
function resetPwdBySmsCode(smscode,newpwd){
	AV.User.resetPasswordBySmsCode(smscode,newpwd).then(function (success) {
		fillAlert('重置密码成功!');
		waitRedirect('../signin/',1000);
  	}, function (error) {
		$j_login_btn.removeClass('disable');
		btnText($j_login_btn,'验证并重置',0);
	  	fillAlert(errorEnum[error.code]['msg']);
  	});
}
function timeCount(){
	$j_sms.html(seconds+' s');
	var t = setInterval(function(){
  		seconds--;
		if(seconds >= 0){
			$j_sms.html(seconds+' s');
		}
		else{
			$j_sms.addClass(s).html('发送短信');
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