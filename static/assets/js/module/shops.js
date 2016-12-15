var p = {
  'className': 'Shops',
  'page': 1,
  'size': 20
};
p.init = function(){
  p.page = misc.getParam('page') || 1;
  $j_pagenation = $('.j_pagenation');
	p.loadDatas();
  p.initEvent();
};
p.loadPagination = function(){
  $('.pages').remove();
  $j_pagenation.append(pagestyle);
  pg.pageCount = p.maxPage; // 定义总页数(必要)
  pg.argName = 'page';  // 定义参数名(可选,默认为page)
  pg.element = $j_pagenation; // 文本渲染在那个标签里面
  pg.printHtml(1);
};
p.initEvent = function(){
	$('#j_create_new').on('click', function (e) {
	    e.preventDefault();
	    if($('.cancel').length<=0){
	        createRow('create');
	    }else{
	        alert('请先执行完当前的操作！');
	    }
	});
  $('#search').on('click', function (e) {
      e.preventDefault();
      p.loadDatas();
  });
};
p.loadDatas = function(){
  var query = new AV.Query(p.className);

  var searchType = $('.search-type').val(),
      searchWord = $.trim($('#search-word').val());
  searchWord && query.startsWith(searchType,searchWord.toLowerCase());
  query.count({
    success: function(data){
      p.maxPage = Math.ceil(data/p.size);
      $('#maxCount').text(data);
    }
  });
  query.descending("sort");
  query.limit(p['size']);
  query.skip((p['page']-1)*p['size']);
	query.find({
	  success: function(datas) {
    	$('#datatable tbody').html(p.htmlDatas(datas));
  		operateEvent();
      p.maxPage>=1 && $('.j_pagenation').show() && p.loadPagination();
	  },
    error: function(user, error) {
      console.log(user+error)
    }
	});  
};

p.htmlDatas = function(datas){
	var arr = [];
	for(var i=0,l=datas.length;i<l;i++){
		arr.push(htmlRow(datas[i]));
  }
	return arr.join('');
};

function htmlRow(data){
    var s = data.get("accountStatus") == "0" ? '<div class="outter-block outter-border"><div class="circle-block boxshowdow"><div></div>':'<div class="outter-block colorGreen"><div class="circle-block boxshowdow pull-right"><div></div>';

    return ['<tr data-id="',data.id,'" data-pid="',data.get('pid'),'">',
              // '<td><a class="edit" href="javascript:;">编辑</a> <a class="delete" href="javascript:;">删除</a> <a class="onoff" href="javascript:;">',s,'</a></td>',
              '<td><a class="onoff" href="javascript:;">',s,'</a></td>',
              '<td class="j_view">',data.get("username"),'</td>',
              '<td class="j_view">',data.get("name"),'</td>',
              '<td><input type="text" class="sort" style="width:50px;" value="',data.get("sort"),'"></td>',
              // '<td>',data.get("address"),'</td>',
              // '<td>',data.get("contact"),'</td>',
              // '<td>',data.get("manager"),'</td>',
              '<td>',misc.formatDateTime(data.createdAt,"yyyy-MM-dd hh:mm"),'</td>',
              '<td>',misc.formatDateTime(data.updatedAt,"yyyy-MM-dd hh:mm"),'</td>',
            '</tr>'].join('');
}
function editShopFunc(param,succ){
  var query = new AV.Query(p.className);
  query.get(param.id, {
      success: succ,
      error: function(user, error) {   
          alert("操作失败 " + error.message);
      }
  });
}
function operateEvent(){

  $('#datatable div.circle-block').off().on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        if($this.hasClass('pull-right')){
          $this.removeClass('pull-right');
          $this.parent().removeClass('colorGreen').addClass('outter-border');
        }
        else{
          $this.addClass('pull-right');
          $this.parent().addClass('colorGreen').removeClass('outter-border');
        }
        var curTR = $(this).closest('tr'),
        id = curTR.attr('data-id');
        if(!id){
          return false;
        }
        var param = {
          'id':id
        };
        editShopFunc(param,function(data) {
          var s = (data.get('accountStatus') == '1') ? '0' : '1';
          data.set('accountStatus',s);
          data.save();
        });
    });
    $('#datatable .sort').off().on('blur', function (e) {
        e.preventDefault();
        var curTR = $(this).closest('tr'),
        id = curTR.attr('data-id');
        if(!id){
          return false;
        }
        var param = {
          'id': id,
          'sort': parseInt(curTR.find('.sort').val())
        };
        editShopFunc(param,function(data) {
          data.set('sort',param['sort']);
          data.save().then(function(){
            location.reload();
          }, function(){
            
          });

        });
    });
    // $('#datatable .j_view').off().on('click', function (e) {
    //     e.preventDefault();
    //     window.open('infoUser.html?id='+$(this).parent().attr('data-id'));
    // });
	// $('#datatable a.delete').off().on('click', function (e) {
 //    	return;
 //        e.preventDefault();
 //        if($('.cancel').length<=0){
 //            if (confirm("你确定删除该条数据 ？") == false) {
	//             return;
	//         }
	//         var curTR = $(this).parent().parent();
	//         if(!curTR.attr('data-id')){
	//         	return false;
	//         }
	//         var params = {
	//         	'_id': curTR.attr('data-id'),
	//         };
 //        }else{
 //            alert('请先执行完当前的操作！');
 //        }
 //    });
 //    $('#datatable a.edit').off().on('click', function (e) {
 //    	// return;
 //        e.preventDefault();
 //        if($('.cancel').length<=0){
 //        	editRow($(this));
 //        }else{
 //            alert('请先执行完当前的操作！');
 //        }
 //    });
}
function createLateEvent(){
    $('#datatable a.cancel').off().on('click', function (e) {
        e.preventDefault();
        $(this).parent().parent().remove();
    });
    $('#datatable a.add').off().on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        var newInputs = $this.parent().parent().find('input');

        for(var i=0,l=newInputs.length;i<l;i++){
        	if(newInputs.eq(i).val()){
        		continue;
        	}
        	else{
        		newInputs.eq(i).focus();
        		alert('不能为空');
        		return false;
        	}
        }
        var params1 = {
          'password': '123456',
          'username': newInputs.eq(0).val(),
          'userRole': 'Shop'
        };
        var params2 = {
          'accountStatus': '0',
        	'username': newInputs.eq(0).val(),
          'name': newInputs.eq(1).val(),
          'sort': parseInt(newInputs.eq(2).val())
          // 'address': newInputs.eq(2).val(),
          // 'contact': newInputs.eq(3).val(),
          // 'manager': newInputs.eq(4).val()
        };
    		var user = new AV.User();
    		for (var property in params1){
    			user.set(property, params1[property]);
    		}
    		user.signUp(null, {
    		  success: function(data) {
            var Shops = AV.Object.extend(p.className);
            var u = new Shops();
            for (var property in params2){
              u.set(property, params2[property]);
            }
            u.set('pid',data.id);
            u.save(null, {
              success: function(data) {
                userObj.logOut();
              },
              error: function(data, error) {
                alert("添加失败 " + error.message);
              }
            });
    		  },
    		  error: function(user, error) {
    		  	alert("添加失败 " + error.message);
    		  }
    		});
    });
}
function editLateEvent(){
    $('#datatable a.cancel').off().on('click', function (e) {
        e.preventDefault();
        commonRow($(this));
    });
    $('#datatable a.confirm').off().on('click', function (e) {
        e.preventDefault();
        var $this = $(this),
        	curTR = $this.parent().parent(),
        	editInputs = curTR.find('input');

        if(!curTR.attr('data-id')){
        	return false;
        }
        for(var i=0,l=editInputs.length;i<l;i++){
        	if(editInputs.eq(i).val()){
        		continue;
        	}
        	else{
        		editInputs.eq(i).focus();
        		alert('不能为空');
        		return false;
        	}
        }

        var params = {
        	'id': curTR.attr('data-id'),
        	'username': editInputs.eq(0).val(),
        	'realname': editInputs.eq(1).val(),
          'username': editInputs.eq(2).val(),
          'nickname': editInputs.eq(3).val(),
          'sex': editInputs.eq(4).val(),
          'mobilePhoneNumber': editInputs.eq(5).val(),
        	'weixin': editInputs.eq(2).val()
        };

        var query = new AV.Query(AV.User);
        query.get(params.id, {
          success: function(user) {
            // debugger
            // user.set("username", "another_username");
            for (var property in params){
            	if(property != 'id'){
      					user.set(property, params[property]);
              }
      			}
            // debugger
            user.save(null, {
              success: function(userAgain) {
                // debugger
              	window.location.reload();
                // window.location.href = window.location.href;
              },
              error: function(userAgain, error) {
		  		      alert("编辑失败 " + error.message);
              }
            });
          },
          error: function(user, error) {   
		  	alert("编辑失败 " + error.message);
          }
        });
        
   //      if(resp.success){
			// commonRow($this);
   //  	}
   //  	else{
   //  		alert(resp.err_msg ? '编辑失败,' + resp.err_msg : '编辑失败');
   //  	}
    });
}
function createRow() {
    var $tbody = $('tbody').eq(0),
        firstTR = $tbody.find("tr:first"),
        tempTR = $('<tr><td style="width:90px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
   	
   	if(firstTR.length==0){
   		tempTR.appendTo($tbody);
   	}else{
    	tempTR.insertBefore(firstTR);
   	}

	var tempTRTDs = tempTR.find('td');
    tempTRTDs.eq(0).html('<a class="add" href="">添加</a> <a class="cancel" href="">取消</a>');
    tempTRTDs.eq(1).html('<input type="text" style="width: 100px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(2).html('<input type="text" style="width: 200px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(3).html('<input type="text" style="width: 100px !important;background: #ffffff;" value="">');
    // tempTRTDs.eq(4).html('<input type="text" style="width: 110px !important;background: #ffffff;" value="">');
    // tempTRTDs.eq(5).html('<input type="text" style="width: 60px !important;background: #ffffff;" value="">');
    createLateEvent();
}
function commonRow(curObj) {
	var curTDs = curObj.parent(), 
		otherTDs = curTDs.siblings(),
		otherTDInputs = otherTDs.find('input');
    curTDs.html('<a class="edit" href="javascript:;">编辑</a> <a class="delete" href="javascript:;">删除</a>');
    otherTDs.eq(0).html(otherTDInputs.eq(0).val());
    otherTDs.eq(1).html(otherTDInputs.eq(1).val());
    otherTDs.eq(2).html(otherTDInputs.eq(2).val());
    operateEvent();
}
function editRow(curObj) {
	var curTDs = curObj.parent(), 
		otherTDs = curTDs.siblings();
    curTDs.html('<a class="confirm" href="">确认</a> <a class="cancel" href="">取消</a>');
    otherTDs.eq(0).html('<input type="text" style="width: 50px !important;background: #ffffff;" value="'+otherTDs.eq(0).text()+'">');
    otherTDs.eq(1).html('<input type="text" style="width: 80px !important;background: #ffffff;" value="'+otherTDs.eq(1).text()+'">');
    otherTDs.eq(2).html('<input type="text" style="width: 80px !important;background: #ffffff;" value="'+otherTDs.eq(2).text()+'">');
    otherTDs.eq(3).html('<input type="text" style="width: 30px !important;background: #ffffff;" value="'+otherTDs.eq(3).text()+'">');
    otherTDs.eq(4).html('<input type="text" style="width: 120px !important;background: #ffffff;" value="'+otherTDs.eq(4).text()+'">');
    otherTDs.eq(5).html('<input type="text" style="width: 120px !important;background: #ffffff;" value="'+otherTDs.eq(5).text()+'">');

    editLateEvent();
}

