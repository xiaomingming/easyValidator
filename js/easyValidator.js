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
        } else if (to.call(data, null) === '[object Function]') {
            type = 'function';
        } else {
            type = 'null';
        }
        return type;
    },
    showMsg: function(opts) {
        return {
            _error: function() {
                opts.errorContainer.text(opts.checker.message).show();
                opts.checkElement.addClass('error-border');
                opts.tipsContainer.hide();
            },
            OK: function() {
                opts.errorContainer.text('').hide();
                opts.checkElement.removeClass('error-border');
            }
        }
    },
    // 此处验证，可以考虑把错误信息压到数组中进行处理
    // 对于不存在的tips，还需要进一步健壮处理
    check: function(checkElement, checkConfig) {
        var checker, result_ok, checkType, value,
            errorContainer, tipsContainer, i, j, validateArr, dLoop, dLen;
        // 获取数值这里，需要判断dom类型
        value = checkElement.val(); //获取当前的字段值
        errorContainer = checkElement.parents('.form-item').find('.error');
        tipsContainer = checkElement.parents('.form-item').find('.tips');
        // 需要遍历checkConfig
        // 判断checkConfig是数组，还是对象，还是字符串
        checkType = this.getType(checkConfig);
        tipsContainer.hide();
        if (checkType === 'string') {
            checker = this.checkFunc[checkConfig];
            result_ok = checker.validate(value); //对单个进行验证
            if (!result_ok) {
                this.showMsg({
                    checkElement: checkElement,
                    errorContainer: errorContainer,
                    tipsContainer: tipsContainer,
                    checker: checker
                })._error();
                return false;
            }
            this.showMsg({
                checkElement: checkElement,
                errorContainer: errorContainer,
                tipsContainer: tipsContainer,
                checker: checker
            }).OK();
        } else if (checkType === 'array') {
            for (i = 0, j = checkConfig.length; i < j; i++) {
                checker = this.checkFunc[checkConfig[i]];
                result_ok = checker.validate(value);
                if (!result_ok) {
                    this.showMsg({
                        checkElement: checkElement,
                        errorContainer: errorContainer,
                        tipsContainer: tipsContainer,
                        checker: checker
                    })._error();
                    return false;
                }
            }
            this.showMsg({
                checkElement: checkElement,
                errorContainer: errorContainer,
                tipsContainer: tipsContainer,
                checker: checker
            }).OK();
        } else if (checkType === 'object') {
            // 调用自定义函数
            // 应当还支持混合验证，即调用通用验证和自定义验证函数
            for (i in checkConfig) {
                if (i === 'tips') {} else if (i === 'defaultValidate') {
                    validateArr = checkConfig.defaultValidate;
                    for (dLoop = 0, dLen = validateArr.length; dLoop < dLen; dLoop++) {
                        checker = this.checkFunc[validateArr[dLoop]];
                        result_ok = checker.validate(value);
                        if (!result_ok) {
                            this.showMsg({
                                checkElement: checkElement,
                                errorContainer: errorContainer,
                                tipsContainer: tipsContainer,
                                checker: checker
                            })._error();

                            return false;
                        }
                    }
                    this.showMsg({
                        checkElement: checkElement,
                        errorContainer: errorContainer,
                        tipsContainer: tipsContainer,
                        checker: checker
                    }).OK();
                } else {
                    checker = checkConfig[i];
                    result_ok = checker.validate(value);
                    if (!result_ok) {
                        this.showMsg({
                            checkElement: checkElement,
                            errorContainer: errorContainer,
                            tipsContainer: tipsContainer,
                            checker: checker
                        })._error();

                        return false;
                    }
                    this.showMsg({
                        checkElement: checkElement,
                        errorContainer: errorContainer,
                        tipsContainer: tipsContainer,
                        checker: checker
                    }).OK();
                }
            }
        }
        result_ok = true;
        return result_ok;
    },
    tips: function(checkElement, checkName, checkConfig) {
        var result_ok,
            errorContainer, tipsContainer;
        // 获取数值这里，需要判断dom类型
        errorContainer = checkElement.parents('.form-item').find('.error');
        tipsContainer = checkElement.parents('.form-item').find('.tips');
        // 需要遍历checkConfig
        // 判断checkConfig是数组，还是对象，还是字符串
        checkElement.removeClass('error-border');
        errorContainer.hide();
        // console.log(checkConfig);
        if (!checkConfig.tips) {
            tipsContainer.text('').hide();
        } else {
            tipsContainer.text(checkConfig.tips).show();
        }
    },
    initialize: function(formId, validateData, checkConfig, callback) {
        // 针对文本输入框进行blur事件绑定
        // 需要支持对无事件隐藏字段的绑定
        var that = this;
        $.each(validateData, function(i, ele) {
            ele.blur(function() {
                checkObj.check(ele, checkConfig[i]);
            }).focus(function() {
                checkObj.tips(ele, i, checkConfig[i]);
            });
            /*ele.keyup(function() {
                checkObj.check(ele, checkConfig[i]);
            }).keydown(function() {
                checkObj.tips(ele, i, checkConfig[i]);
            });*/
        });

        // formId.find('input[type="submit"]').click(function(e) {
        formId.on('submit',function(e){
            var flag = true;
            // 若验证全部完成，则进行表单提交
            $.each(validateData, function(i, ele) {
                if (!checkObj.check(ele, checkConfig[i])) {
                    flag = false;
                };
            });

            if ( !! callback && (that.getType(callback) === 'function')) {
                //存在回调的情形
                flag && callback();
            } else {
                //使用默认提交的action
                // 阻止默认提交
                !flag&&e.preventDefault();
                // flag && formId.get(0).submit();
            }
        });
    }
}
/*
 * 考虑到常用的字段验证包含了基本验证函数中的一些，所以，可以把这些封装起来，而不用通过数组的方式调用最小验证函数
 */
// 用户名验证
checkObj.checkFunc.userName = {
    validate: function(val) {
        if ($.trim(val) === '') {
            this.message = '用户名不能为空';
            return false;
        }
        if (/\w/g.test(val) === false) {
            this.message = '用户名输入只能为数字，字母和下划线';
            return false;
        }
        if ($.trim(val).length > 16 || $.trim(val).length < 2) {
            this.message = '用户名长度错误';
            return false;
        }
        return true;
    },
    message: ''
};
/*
 * 检查是否为空
 */
checkObj.checkFunc.isEmpty = {
    validate: function(val) {
        return $.trim(val) !== '';
    },
    message: '输入不能为空！' //错误消息
}
/*
 * 检查电子邮件
 */
checkObj.checkFunc.isEmail = {
    validate: function(val) {
        var _reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return _reg.test(val);
    },
    message: '请填写正确的邮件格式！' //错误消息
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
    message: '请填写正确的用户名！' //错误消息
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
    message: '请输入正确的密码格式'
};
/*
 * 检查是否选择项目
 */
checkObj.checkFunc.isChecked = {
    validate: function(val) {
        return val;
    },
    message: '未选择值!' //错误消息
}