var TableEditable = function () {

    return {

        //main function to initiate the module
        init: function () {
            function restoreRow(oTable, nRow) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);

                for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                    oTable.fnUpdate(aData[i], nRow, i, false);
                }

                oTable.fnDraw();
            }

            function createOrEditRow(oTable, nRow, type) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);
                if(type == 'create'){
                    jqTds[0].innerHTML = '<a class="edit" href="">添加</a> <a class="cancel" data-mode="new" href="">取消</a>';
                }
                else{
                    jqTds[0].innerHTML = '<a class="edit" href="">确认</a> <a class="cancel" href="">取消</a>';
                }
                jqTds[1].innerHTML = '<input type="text" class="m-wrap small"style="background: #ffffff;" value="' + aData[1] + '">';
                jqTds[2].innerHTML = '<input type="text" class="m-wrap small"style="background: #ffffff;" value="' + aData[2] + '">';
                jqTds[3].innerHTML = '<input type="text" class="m-wrap small" style="width: 180px !important;background: #ffffff;" value="' + aData[3] + '">';
            }

            function saveRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                oTable.fnUpdate('<a class="edit" href="javascript:;">编辑</a> <a class="forbidden" href="javascript:;">封号</a> <a class="delete" href="javascript:;">删除</a>', nRow, 0, false);
                oTable.fnUpdate(jqInputs[0].value, nRow, 1, false);
                oTable.fnUpdate(jqInputs[1].value, nRow, 2, false);
                oTable.fnUpdate(jqInputs[2].value, nRow, 3, false);
                oTable.fnDraw();
            }

            var oTable = $('#sample_editable_1').dataTable({
                "aLengthMenu": [
                    [5, 10, 20, -1],
                    [5, 10, 20, "全部"] // change per page values here
                ],
                // set the initial value
                "iDisplayLength": 10,
                "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
                "sPaginationType": "bootstrap",
                "oLanguage": {
                    "sLengthMenu": "每页显示 _MENU_ 条数据",
                    "oPaginate": {
                        "sPrevious": "上一页",
                        "sNext": "下一页"
                    }
                },
                "aoColumnDefs": [{
                        'bSortable': false,
                        'aTargets': [0]
                    }
                ]
            });

            jQuery('#sample_editable_1_wrapper .dataTables_filter input').addClass("m-wrap medium"); // modify table search input
            jQuery('#sample_editable_1_wrapper .dataTables_length select').addClass("m-wrap small"); // modify table per page dropdown
            jQuery('#sample_editable_1_wrapper .dataTables_length select').select2({
                showSearchInput : false //hide search box with special css class
            }); // initialzie select2 dropdown

            var nEditing = null;

            $('#sample_editable_1_new').click(function (e) {
                e.preventDefault();
                if($('.cancel').length<=0){
                    var aiNew = oTable.fnAddData(['', '', '', '','']);
                    var nRow = oTable.fnGetNodes(aiNew[0]);
                    createOrEditRow(oTable, nRow, 'create');
                    nEditing = nRow;
                }else{
                    alert('请先完成当前操作');
                }
            });

            $('#sample_editable_1 a.delete').live('click', function (e) {
                e.preventDefault();
                if (confirm("你确定删除该条数据 ？") == false) {
                    return;
                }
                var nRow = $(this).parents('tr')[0];
                oTable.fnDeleteRow(nRow);
            });

            $('#sample_editable_1 a.cancel').live('click', function (e) {
                e.preventDefault();
                if ($(this).attr("data-mode") == "new") {
                    var nRow = $(this).parents('tr')[0];
                    oTable.fnDeleteRow(nRow);
                } else {
                    restoreRow(oTable, nEditing);
                    nEditing = null;
                }
            });

            $('#sample_editable_1 a.edit').live('click', function (e) {
                e.preventDefault();
                var nRow = $(this).parents('tr')[0];
                if (nEditing == nRow && this.innerHTML == "确认") {
                    debugger
                    saveRow(oTable, nEditing);
                    nEditing = null;
                    alert("编辑成功！");
                } 
                else if (nEditing == nRow && this.innerHTML == "添加") {
                    if (confirm("确认添加新数据 ？") == false) {
                        return;
                    }
                    saveRow(oTable, nEditing);
                    nEditing = null;
                    alert("添加成功！");
                } 
                else {
                    if($('.cancel').length<=0){
                        createOrEditRow(oTable, nRow);
                        nEditing = nRow;
                    }
                    else{
                        alert('请先完成当前操作');
                    }  
                }
            });
        }

    };

}();