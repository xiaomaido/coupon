var userObj = {
	'role': {
		'admin': {
			'title': 'admin',
			'desc': '管理员',
		}
	}
};
userObj.init = function(){
	userObj.currentUser = AV.User.current();
	debugger
	// if(location.href.indexOf('/login') == '-1'){
	// 	user.checkLogin();
	// }
	// else{
	// 	user.homepage();
	// }
};
userObj.checkLogin = function(){
	if(!userObj.currentUser){
		location.href = "login.html";
	}
	debugger
	if(userObj.currentUser.get('userRole')=="Shop"){
		getUserInfo();
	}
};
function getShopInfo(){
	var query = new AV.Query('Shops');
	query.equalTo('pid',userObj.currentUser.id);
	query.first({
	  success: function(datas) {
	  	debugger
	  	userObj.shopInfo = datas[0];
	  }
	}); 
};
	
userObj.initCommon = function(){
	userObj.initData();
	userObj.initEvent();
};
userObj.initData = function(){
	var n = userObj.currentUser.get('userRole');
	$('.j_username').text(userObj.role[n].desc + ' ' +userObj.currentUser.getUsername());
	if(n == 'admin'){
		$('.j_admin_see').show();
	}
};
userObj.initEvent = function(){
    $('.j_logout').on('click',function() {
        AV.User.logOut();
        waitRedirect('login.html', 1000);
    });
};
userObj.init();