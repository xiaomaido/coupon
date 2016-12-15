var p = {
  'className': 'CouponLog',
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
  if(userObj.currentUser.get('userRole')=='Shop'){
    query.equalTo("shopId",userObj.currentUser.id);
  }
  var searchType = $('.search-type').val(),
      searchWord = $.trim($('#search-word').val());
  searchWord && query.startsWith(searchType,searchWord.toLowerCase());
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
              '<td class="">',data.get("shopChain"),'</td>',
              '<td class="">',data.get("shopChainName"),'</td>',
              '<td>',data.get("couponType"),'</td>',
              '<td style="max-width: 260px;">',data.get("couponName"),'</td>',
              '<td>',data.get("isVip")[0]!="0"?"指定用户":"无",'</td>',
              '<td>',data.get("mobile"),'</td>',
              '<td>',misc.formatDateTime(data.createdAt,"yyyy-MM-dd hh:mm"),'</td>',
            '</tr>'].join('');
}