// 应当还要支持动态字段验证
// 其它表单元素，如radio无需验证，因为它总是有默认值的
// checkbox的验证比较复杂了，可以通过埋藏隐藏域来判断checkbox列表中是否有选中，因此，这个验证，只需要验证隐藏域的值是否存在
// 可以通过自定义回调函数来做验证
// 
// radio,checkbox,fileup 等验证，由于绑定的事件不是blur，可以通过回调自定义
var checkObj = { /**数据验证类**/
    checkFunc: {}, //验证数据的函数对象集合
    // errorMessage:[],//错误消息
    // rightMessage:[],//正确消息
    showInfoFunc: {}, //显示消息的函数
    getType: function(data) {
        var to = Object.prototype.toString,
            type = 'string';
        if (to.call(data, null) === '[object Array]') {
            // 传入的是个数组
            type = 'array'
        } else if (typeof data === 'string') {
            // 仅仅传入了一个字符串
            type = 'string';
        } else if (to.call(data, null) === '[object Object]') {
            // 传入的是个对象
            type = 'object';
        } else {
            type = 'null'
        }
        return type;
    },
    check: function(data, checkConfig) { //验证
        var checkValue, checker, result_ok, checkType, value, errorContainer, tipsContainer;
        // 获取数值这里，需要判断dom类型
        value = data.val(); //获取当前的字段值
        errorContainer = data.parents('.form-item').find('.error');
        tipsContainer = data.parents('.form-item').find('.tips');
        checkValue = checkConfig; //获得相应的验证规则函数名称
        // 需要遍历checkValue
        // 判断checkValue是数组，还是对象，还是字符串
        checkType = this.getType(checkValue);
        tipsContainer.hide();
        if (checkType === 'string') {
            checker = this.checkFunc[checkValue];
            result_ok = checker.validate(value); //对单个进行验证
            if (!result_ok) {
                errorContainer.text(checker.message).show();
                return false;
            }
            errorContainer.text('').hide();

        } else if (checkType === 'array') {
            for (var k = 0, h = checkValue.length; k < h; k++) {
                result_ok = this.checkFunc[checkValue[k]].validate(value);
                if (!result_ok) {
                    errorContainer.text(this.checkFunc[checkValue[k]].message).show();
                    tipsContainer.hide();
                    return false;
                }
            }
            errorContainer.text('').hide();
        } else if (checkType === 'object') {
            // 调用自定义函数
            // 应当还支持混合验证，即调用通用验证和自定义验证函数
            // 使用defaultValidate来配置默认
            // 不进行默认与自定义函数名称重复判断
            // 若重名，默认配置覆盖自定义配置
            // if(!!checkValue.defaultValidate){
            for (var j in checkValue) {
                if (j === 'defaultValidate') {
                    var validateArr = checkValue.defaultValidate;
                    for (var dLoop = 0, dLen = validateArr.length; dLoop < dLen; dLoop++) {
                        result_ok = this.checkFunc[validateArr[dLoop]].validate(value);
                        if (!result_ok) {
                            errorContainer.text(this.checkFunc[validateArr[dLoop]].message).show();
                            tipsContainer.hide();
                            return false;
                        }
                    }
                    errorContainer.text('').hide();
                } else {
                    result_ok = checkValue[j].validate(value);
                    if (!result_ok) {
                        errorContainer.text(checkValue[j].message).show();
                        tipsContainer.hide();
                        return false;
                    }
                    errorContainer.text('').hide();
                }
            }
        }
        result_ok = true;
        return result_ok;
    },
    tips: function(data, checkConfig) {
        var checkValue, checker, checkType, value, errorContainer, tipsContainer;
        // 获取数值这里，需要判断dom类型
        value = data.val(); //获取当前的字段值
        errorContainer = data.parents('.form-item').find('.error');
        tipsContainer = data.parents('.form-item').find('.tips');
        checkValue = checkConfig; //获得相应的验证规则函数名称
        // 需要遍历checkValue
        // 判断checkValue是数组，还是对象，还是字符串
        checkType = this.getType(checkValue);

        if (checkType === 'string') {
            checker = this.checkFunc[checkValue];
            tipsContainer.text(checker.tips).show();
            errorContainer.hide();
        } else if (checkType === 'array') {
            for (var k = 0, h = checkValue.length; k < h; k++) {
                tipsContainer.text(this.checkFunc[checkValue[k]].tips).show();
                errorContainer.hide();
            }
        } else if (checkType === 'object') {
            // 调用自定义函数
            // 应当还支持混合验证，即调用通用验证和自定义验证函数
            // 使用defaultValidate来配置默认
            // 不进行默认与自定义函数名称重复判断
            // 若重名，默认配置覆盖自定义配置
            // if(!!checkValue.defaultValidate){
            for (var j in checkValue) {
                if (j === 'defaultValidate') {
                    var validateArr = checkValue.defaultValidate;
                    for (var dLoop = 0, dLen = validateArr.length; dLoop < dLen; dLoop++) {
                        tipsContainer.text(this.checkFunc[validateArr[dLoop]].tips).show();
                        errorContainer.hide();
                    }
                } else {
                    tipsContainer.text(checkValue[j].tips).show();
                    errorContainer.hide();
                }
            }

        }
    },
    initialize: function(formId, validateData, checkConfig) {
        // 针对文本输入框进行blur事件绑定
        // 需要支持对无事件隐藏字段的绑定
        $.each(validateData, function(i, ele) {
            var textInput = ele.filter('[type="text"]'),
                passwordInput = ele.filter('[type="password"]'),
                selectElement = ele.filter('select'),
                textArea = ele.filter('textarea'),
                hiddenValue = ele.filter('[type="hidden"]');
            textInput.blur(function() {
                checkObj.check(validateData[i], checkConfig[i]);
                // !!callback&&(typeof callback==='fucntion')&&callback.call(null,arguments);
            }).focus(function() {
                checkObj.tips(validateData[i], checkConfig[i]);
            });
            passwordInput.blur(function() {
                checkObj.check(validateData[i], checkConfig[i]);
            }).focus(function(){
                checkObj.tips(validateData[i], checkConfig[i]);
            });
            textArea.blur(function() {
                checkObj.check(validateData[i], checkConfig[i]);
            }).focus(function(){
                checkObj.tips(validateData[i], checkConfig[i]);
            });
            selectElement.change(function() {
                checkObj.check(validateData[i], checkConfig[i]);
            });
            // (hiddenValue.length) && checkObj.check(validateData[i], checkConfig[i]);
        });

        formId.find('input[type="submit"]').click(function(e) {
            // 阻止默认提交
            e.preventDefault();
            var flag = true;
            // 若验证全部完成，则进行表单提交
            $.each(validateData, function(i, ele) {
                if (!checkObj.check(validateData[i], checkConfig[i])) {
                    flag = false;
                };
            });
            flag && formId.get(0).submit();
        });
    }
}

/*
 * 检查是否为空
 */
checkObj.checkFunc.isEmpty = {
    validate: function(val) {
        return $.trim(val) !== '';
    },
    message: '输入不能为空！', //错误消息
    tips: '这个是必填项'
}
/*
 * 检查电子邮件
 */
checkObj.checkFunc.isEmail = {
    validate: function(val) {
        var _reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return _reg.test(val);
    },
    message: '请填写正确的邮件格式！', //错误消息
    tips: '邮件是你找回重要信息的必填字段'
}
/*
 * 检查用户名
 * 用户名只能为数字，字母，中划线，下滑线组合，长度不做限制
 */
checkObj.checkFunc.isUserName = {
    validate: function(val) {
        var _reg = /[0-9a-zA-Z_-]/;
        return _reg.test(val);
    },
    message: '请填写正确的用户名！', //错误消息
    tips: '必须填写用户名'
}
/*
 * 检查密码格式
 * 此处密码为数字，字母，下划线组合，6-16位
 */
checkObj.checkFunc.isPassword = {
    validate: function(val) {
        var _reg = /^[0-9a-zA-Z]{6,16}$/;
        return _reg.test(val);
    },
    message: '请输入正确的密码格式',
    tips: '不写密码，你作死么'
};
/*
 * 检查是否选择项目
 */
checkObj.checkFunc.isChecked = {
    validate: function(val) {
        return val;
    },
    message: '未选择值!', //错误消息
    tips: '选择呀'
}