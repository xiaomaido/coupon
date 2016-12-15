var p = {
  'className': 'Coupons',
  'page': 0,
  'size': 5
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
      e.stopPropagation();
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
  query.equalTo("shopId",userObj.currentUser.id);
  query.count({
    success: function(data){
      p.maxPage = Math.ceil(data/p.size);
      $('#maxCount').text(data);
    }
  });
  query.descending("createdAt");
  query.limit(p['size']);
  query.skip((p['page']-1)*p['size']);
  query.find({
    success: function(datas) {
      $('#datatable tbody').html(p.htmlDatas(datas));
      operateEvent();
      p.maxPage>=1 && $('.j_pagenation').show() && p.loadPagination();
    },
    error: function(datas, error) {

    }
  });  
};

// p.loadUsersByArrayKey= function(type,adminId,cb){
//   var query = new AV.Query('Users');
//   query.equalTo("isShow","1");
//   var searchType = $('.search-type').val(),
//       searchWord = $.trim($('#search-word').val());
//   searchWord && query.startsWith(searchType,searchWord.toLowerCase());
//   if(p.checkin=="checkin"){
//     query.equalTo("checkin","true");
//   }else if(p.checkin=="uncheckin"){
//     query.notEqualTo("checkin","true");
//   }
//   type && query.equalTo(type, adminId);
//   query.count({
//     success: function(data){
//       p.maxPage = Math.ceil(data/p.size);
//       $('#maxCount').text(data);
//     }
//   });
//   query.ascending("flagNumber");
//   // query.ascending("pid");
//   // query.descending("createdAt");
//   query.limit(p['size']);
//   query.skip((p['page']-1)*p['size']);
//   query.find().then(function(datas){
//     if(datas && datas.length>0){
//       cb && cb(datas);
//     }
//     else{
//       p.clearTablePages();
//     }
//   }, function(error){
//     alert('query error')
//   });
// }
p.htmlDatas = function(datas){
  var arr = [];
  for(var i=0,l=datas.length;i<l;i++){
    arr.push(htmlRow(datas[i]));
  }
  return arr.join('');
};
function htmlRow(data){
    var s = data.get("isShow") == "0" ? '<div class="outter-block outter-border"><div class="circle-block boxshowdow"><div></div>':'<div class="outter-block colorGreen"><div class="circle-block boxshowdow pull-right"><div></div>';
    return ['<tr data-id="',data.id,'">',
              '<td>',s,'</td>',
              '<td >',data.get("sort"),'</td>',
              '<td>',data.get("activity"),'</td>',
              '<td>',data.get("type"),'</td>',
              '<td class="j_view" style="color:#4b8df8;cursor:pointer;">',data.get("name"),'</td>',
              '<td>',data.get("vips")[0]!="0"?"指定用户":"无限制",'</td>',
              '<td>',data.get("times"),'</td>',
              '<td>',data.get("nums"),'</td>',
              '<td class="j_view">',data.get("beginDatetime") ? misc.formatDateTime(data.get('beginDatetime'),userObj.format):"<span style=\"color:#e02222;cursor:pointer;\">点此设置</span>",'</td>',
              '<td class="j_view">',data.get("endDatetime") ? misc.formatDateTime(data.get('endDatetime'),userObj.format):"<span style=\"color:#e02222;cursor:pointer;\">点此设置</span>",'</td>',
              '<td class="j_view">',misc.formatDateTime(data.createdAt,userObj.format),'</td>',
              // '<td>',misc.formatDateTime(data.get("endDatetime"),userObj.format),'</td>',
              // '<td>',misc.formatDateTime(data.createdAt,userObj.format),'</td>',
              // '<td>',misc.formatDateTime(data.updatedAt,userObj.format),'</td>',
            '</tr>'].join('');
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
        var query = new AV.Query(p.className);
        query.get(id, {
            success: function(data) {
              var property = 'isShow';
              var s = (data.get(property) == '1') ? '0' : '1';
              data.set(property,s);
              data.save();
            },
            error: function(user, error) {   
                alert("操作失败 " + error.message);
            }
        });
    });

    $('#datatable .j_view').off().on('click', function (e) {
        e.preventDefault();
        window.open('coupon.html?id='+$(this).parent().attr('data-id')+'#shop');
    });
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

        for(var i=0,l=newInputs.length;i<2;i++){
          if(newInputs.eq(i).val()){
            continue;
          }
          else{
            newInputs.eq(i).focus();
            alert('不能为空');
            return false;
          }
        }
        var params = {
          'sort': parseInt(newInputs.eq(0).val()),
          'activity': newInputs.eq(1).val(),
          'type': newInputs.eq(2).val(),
          'name': newInputs.eq(3).val(),
          'content': newInputs.eq(4).val(),
          'times': parseInt(newInputs.eq(5).val()),
          'isShow': '0',
          'nums': 0,
          'shopId':userObj.currentUser.id,
          'shopUserName':userObj.currentUser.get('username')
          // 'shopName':userObj.currentUser.id
        };
        var Coupons = AV.Object.extend(p.className);
        var v = new Coupons();
        for (var property in params){
          v.set(property, params[property]);
        }
        v.save(null, {
          success: function(data) {
            window.location.reload();
          },
          error: function(data, error) {
            alert("添加失败 " + error.message);
          }
        });
    });
}

function createRow() {
    var $tbody = $('tbody').eq(0),
        firstTR = $tbody.find("tr:first"),
        tempTR = $('<tr><td style="width:60px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    
    if(firstTR.length==0){
      tempTR.appendTo($tbody);
    }else{
      tempTR.insertBefore(firstTR);
    }

  var tempTRTDs = tempTR.find('td');
    tempTRTDs.eq(0).html('<a class="add" href="">添加</a> <a class="cancel" href="">取消</a>');
    tempTRTDs.eq(1).html('<input type="text" style="width: 30px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(2).html('<input type="text" style="width: 80px !important;background: #ffffff;" value="">');
    // tempTRTDs.eq(3).html('<select class="type"><option value="">请选择<option><option value="1">满减券<option><option value="2">现金券<option><option value="3">免单券<option><option value="4">折扣券<option><option value="5">券宝<option></select>');
    tempTRTDs.eq(3).html('<input type="text" style="width: 80px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(4).html('<input type="text" style="width: 100px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(5).html('<input type="text" style="width: 100px !important;background: #ffffff;" value="">');
    tempTRTDs.eq(6).html('<input type="text" style="width: 30px !important;background: #ffffff;" value="">');
    // tempTRTDs.eq(7).html('');
    // tempTRTDs.eq(8).html('<input type="text" style="width: 70px !important;background: #ffffff;" value="">');
    // tempTRTDs.eq(9).html('<input type="text" style="width: 70px !important;background: #ffffff;" value="">');
    createLateEvent();
}
// p.showUsers = function(datas){
//   $('#datatable tbody').html(p.htmlDatas(datas));
//   operateEvent();
//   p.maxPage>=1 && $j_pagenation.show() && p.loadPagination();
// };
// // 重写分页函数
// showPages.prototype.toPage = function(page){ //页面跳转
//  var turnTo = 1;
//  if (typeof(page) == 'object') {
//   turnTo = page.options[page.selectedIndex].value;
//  } else {
//   turnTo = page;
//  }
//  p.page = turnTo;
//  p.loadUsersByArrayKey(p.admin.get("type"),userObj.currentUser.id,p.showUsers);
// };
// showPages.prototype.printHtml = function(mode){ //显示html代码
//  this.page = p.page ? p.page : 1;
//  this.checkPages();
//  this.showTimes += 1;
//  this.element.append('<div id="pages_' + this.name + '_' + this.showTimes + '" class="pages"></div>');
//  document.getElementById('pages_' + this.name + '_' + this.showTimes).innerHTML = this.createHtml(mode);
// };

