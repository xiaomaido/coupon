var p = {
  'className': 'Shops'
};
p.init = function(){
  p.initVar();
	p.loadDatas();
  p.initEvent();
};
p.initVar = function(){
  obj = {};
  IMGEnum = {
    'jpg':'jpg',
    'jpeg':'jpeg',
    'png':'png',
    'gif':'gif',
    'bmp':'bmp'
  };
};
p.loadDatas = function(){
  var query = new AV.Query(p.className);
  query.equalTo('pid',misc.getParam('pid') || userObj.currentUser.id);
  query.find({
    success: function(datas){
      if(datas && datas.length>0){
        obj = datas[0];
        if(obj && obj.id){
            var temp = obj.attributes;
            temp.id = obj.id;
            temp['createdAt'] = misc.formatDateTime(obj['createdAt'],userObj.format);
            temp['updatedAt'] = misc.formatDateTime(obj['updatedAt'],userObj.format);
            obj = temp;
            var arr = [];
            for (var i in obj) {
                if(obj[i]){
                  if(i.indexOf('img')>=0){
                    arr.push({'name': i.trim(), 'url': obj[i].trim()});
                  }
                  else{
                    if(i=='logo'){
                      $('.'+i).attr('src',obj[i]);
                    }
                    else{
                      $('.'+i).val(obj[i]);
                    }
                  }
                }
            };
            arr.sort(getSortFun('asc', 'name'));
            for (var i = 0,l = arr.length; i < l; i++) {
                // $j_infoUser.append('<li><img class="'+arr[i].name+' vImg" src="'+arr[i].url+'" style="width: 400px;height:auto"/></li>');
                $('#datatable tbody').append(imgHtml(arr[i].name,arr[i].url));
            };

            operateEvent();
        }
        else{
          alert('出错了，商户不存在');
          return false;
        }
      }
    },
    error: function(user, error) {
      lert('服务器不给力哦');
    }
  });  
};
function operateEvent(){
    $('#datatable a.view').off().on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('body').append('<div class="shadow-area j_prop" style="display: block;"></div><div class="prop-area j_prop">加载中...</div>');
        var newImg = new Image();
        newImg.src = $(this).attr('data-url');
        newImg.onload = function(){
          var $prop_area = $('.prop-area');
          $prop_area.html('<img style="width:400px;height:auto;" src="'+newImg.src+'" />');
              var $img = $prop_area.find('img');
              var style = {
                'margin-left': -0.5*$img.width()+'px', 
                'margin-top': -0.5*$img.height()+'px', 
              };
              $prop_area.css(style);
        };
        $('.shadow-area').on('click',function(){
          $('.j_prop').remove();
        });
    });
  $('#datatable a.delete').off().on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (confirm("你确定删除该图片 ？") == false) {
            return;
        }
        var curTR = $(this).parent().parent();
        if(!curTR.attr('data-name')){
          return false;
        }
        var query = new AV.Query(p.className);
        query.get(obj.id, {
            success: function(data) {
                data.set(curTR.attr('data-name'),'')
                data.save();
                curTR.remove();
            },
            error: function(user, error) {   
                alert("删除失败 " + error.message);
            }
        });
    });

  $('#datatable a.save').off().on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        
        var curTR = $(this).parent().parent();
        if(!curTR.attr('data-name')){
          return false;
        }
        var query = new AV.Query(p.className);
        query.get(obj.id, {
            success: function(data) {
                data.set(curTR.attr('data-name'),curTR.find('.img-src').val());
                data.save();
                alert("保存成功");
            },
            error: function(user, error) {   
                alert("保存失败");
            }
        });
    });
};
function imgHtml(n,v){
  return ['<tr data-name="',n,'" data-url="',v,'">',
        '<td>',
          '<a class="delete" href="javascript:;">删除</a> ',
          '<a class="save" href="javascript:;">保存</a> ',
          '<a class="view" data-url="',v,'" href="javascript:;">查看大图</a>',
        '</td>',
        '<td>',
          n,
        '</td>',
        '<td>',
          '<textarea class="img-src" style="width:260px" rows="5">',v,'</textarea>',
        '</td>',
        '<td>',
          '<img style="width:200px;height:auto;" src="',v,'" />',
        '</td>',
      '</tr>'].join('');
}

p.initEvent = function(){

  $('.j_btn_modify').on('click',function(e){
    e.stopPropagation();
    e.preventDefault();
    var span_el = $(this).siblings('span').first();
    var query = new AV.Query(p.className);
    query.get(obj.id, {
        success: function(data) {
          var inputs = $('.j_infoUser input');
          data.set('name',$.trim($('.name').val()));
          data.set('addr',$.trim($('.addr').val()));
          data.set('contact',$.trim($('.contact').val()));
          data.set('address',$.trim($('.address').val()));
          data.set('tags',$.trim($('.tags').val()).replace(/,/g," ").replace(/，/g," ").replace(/、/g," "));
          data.set('category',$.trim($('.category').val()));
          data.set('manager',$.trim($('.manager').val()));
          data.set('managerContact',$.trim($('.managerContact').val()));
          data.set('code',$.trim($('.code').val()));
          data.set('slogan',$.trim($('.slogan').val()));
          data.set('bulletin',$.trim($('.bulletin').val()));
          data.set('chains',$.trim($('.chains').val()));
          data.save(null,{
            success: function(d){
              span_el.text('修改成功').show().fadeOut(800);
            },
            error: function(d, error) {
              span_el.text('修改失败').show().fadeOut(800);
            }
          });
        },
        error: function(shop, error) {   
          span_el.text('修改失败').show().fadeOut(800);
        }
    });
  });

  var photo_id = '#photoFileUpload';
  $('.j_upload_img').on('click',function(){
    $(photo_id).trigger('click');
  });
  $(photo_id).change(function(){
    uploadIMG(photo_id);
  });

  var code_id = '#imagesFileUpload';
  $('#j_upload_new').on('click',function(){
    $(code_id).trigger('click');
  });
  $(code_id).change(function(){
    uploadShopImages(code_id);
  });
};

function checkIMG(name,size,max_size){
  var fileType = name.substring(name.lastIndexOf(".")+1);
  if(!IMGEnum.hasOwnProperty(fileType)){
      alert('格式不对，图片格式应为jpg、jpeg、png、gif、bmp');
      return false;
  }
  if(size > max_size * 1024){
      alert('图片大小限制在'+max_size+'KB以下');
      return false;
  }
  return true;
}
function uploadShopImages(id){
    var fileUploadControl = $(id)[0];
    if (fileUploadControl.files.length > 0) {
      var fileObjs = fileUploadControl.files[0];
      if(checkIMG(fileObjs.name,fileObjs.size,200)){
        var file = new AV.File(fileObjs.name, fileObjs);    
        file.save().then(function(ob) {
          var url = ob.url();
          var query = new AV.Query(p.className);
          query.get(obj.id, {
            success: function(shop) {
              var $vImg = $('.vImg');
              var maxImgIdx = -1;
              if($vImg && $vImg.length>0){
                maxImgIdx = parseInt($vImg.eq($vImg.length-1).attr('class').substring(3,4));
              }
              var newImgIdx = maxImgIdx + 1;
              shop.set('img'+newImgIdx,url);
              shop.save(null, {
                  success: function(d) {
                    location.reload();
                  }
              });
            },
            error: function(shop, error) {   
              alert('保存图片失败')
            }
          });
        }, function(error) {
          alert('图片上传失败,'+ error.message);
        });
      }
    }
}

function uploadIMG(id){
    var fileUploadControl = $(id)[0];
    if (fileUploadControl.files.length > 0) {
      var fileObjs = fileUploadControl.files[0];
      if(!checkIMG(fileObjs.name,fileObjs.size,120)){
        return false;
      }
      var file = new AV.File(fileObjs.name, fileObjs);     
      file.save().then(function(ob) {
        var url = ob.url();
        var query = new AV.Query(p.className);
        query.get(obj.id, {
            success: function(d) {
              //把返回的文件插入到文件列表
              d.set("logo", url);
              d.save();
              $(".logo").attr('src',url);
            },
            error: function(shop, error) {   
              alert("上传失败 " + error.message);
            }
        });
      }, function(error) {
        alert('上传失败,'+ error.message);
    });
    }
}
