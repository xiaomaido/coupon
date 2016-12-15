var p = {
  'className': 'Coupons'
};
p.init = function(){
  p.initVar();
  p.loadDatas();
  p.initEvent();
};
p.initVar = function(){
  obj = {};
  obj.id = misc.getParam('id') || '';
  IMGEnum = {
    'jpg':'jpg',
    'jpeg':'jpeg',
    'png':'png',
    'gif':'gif',
    'bmp':'bmp'
  };
  $("#beginDatetime,#endDatetime").datetimepicker({
    format: "yyyy/MM/dd hh:mm:ss",
    language: 'zh-CN',
    autoclose: true,
    todayBtn: true,
    pickDate: true,
    pickTime: true,
    pickerPosition: "bottom-left",
    inputMask: true
  });
};
p.loadDatas = function(){
  var query = new AV.Query(p.className);
  query.get(obj.id,{
    success: function(data){
      obj = data;
      if(obj && obj.id){
          $('.createdAt').text(misc.formatDateTime(obj['createdAt'],userObj.format));
          $('.updatedAt').text(misc.formatDateTime(obj['updatedAt'],userObj.format));
          if(obj.get('beginDatetime'))
              $('.beginDatetime').val(misc.formatDateTime(obj.get('beginDatetime'),userObj.format));
          if(obj.get('endDatetime'))
              $('.endDatetime').val(misc.formatDateTime(obj.get('endDatetime'),userObj.format));

          $('.couponImg').attr("src",obj.get("couponImg"));
          $('.activity').val(obj.get('activity'));
          $('.type').val(obj.get('type'));
          $('.name').val(obj.get('name'));
          $('.vips').val(obj.get('vips').join('-'));
          // var vipArr=obj.get("vips");
          // $('.vips').eq(0).val(vipArr[0]);
          // if(vipArr[0]!="0"){
          //   var arr=[];
          //   for (var i = 1,l = vipArr.length; i < l; i++) {
          //     arr.push(['<div style="float: left;">no.',i,' <input class="vips" style="width: 100px" value="',vipArr[i],'"/><span style="margin:0 15px 0 5px;">移除</span></div>'].join(''));
          //   }
          //   $('.vips-list').append(arr.join('')).show();
          // }
         
          // $('.vips').each(function(index, el) {
          //   $(el).val(vipArr[index]);
          // });

          // $('.content').val(obj.get('content'));
          $('.times').val(obj.get('times'));
          $('.sort').val(obj.get('sort'));
          $('.nums').text(obj.get('nums'));
      }
      else{
          alert('该优惠券不存在');
          return false;
      }
    },
    error: function(user, error) {
      alert('服务器不给力哦');
    }
  });  
};

p.initEvent = function(){
  $('.j_btn_copy').on('click', function(e) {
    e.preventDefault();
    if (confirm('确认执行复制券操作？')) {
        var query = new AV.Query(p.className);
        query.get(obj.id, {
            success: function(data) {
              var params = data.attributes;
              var Coupons = AV.Object.extend(p.className);
              var v = new Coupons();
              for (var property in params){
                v.set(property, params[property]);
              }
              v.set("nums",0);
              v.set("isShow","0");
              v.set("vips",["0"]);
              v.save(null, {
                success: function(da) {
                  window.location.href='coupons.html';
                },
                error: function(da, error) {
                  alert("复制失败 " + error.message);
                }
              });
            },
            error: function(shop, error) {   
                alert("复制失败 " + error.message);
            }
        });
    }
  });
  $('.j_btn_modify').on('click',function(e){
    e.stopPropagation();
    e.preventDefault();
    var span_el = $(this).siblings('span').first();
    var query = new AV.Query(p.className);
    query.get(obj.id, {
        success: function(data) {
          data.set('beginDatetime',strToDate($.trim($('.beginDatetime').val())));
          data.set('endDatetime',strToDate($.trim($('.endDatetime').val())));
          data.set('activity',$.trim($('.activity').val()));
          data.set('type',$.trim($('.type').val()));
          data.set('name',$.trim($('.name').val()));
          data.set('content',$.trim($('.content').val()));
          data.set('vips',$('.vips').val().split('-'));
          data.set('times',parseInt($.trim($('.times').val())));
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
      if(checkIMG(fileObjs.name,fileObjs.size,130)){
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
              d.set("couponImg", url);
              d.save();
              $(".couponImg").attr('src',url);
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
