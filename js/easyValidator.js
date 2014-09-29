/*
 *  author:leweiming
 *  gmail: xmlovecss
 *  支持必须和非必须字段验证
 *  非必须字段只是在失去焦点时验证，提交不做验证
 *  目前只是支持预载入验证，不支持异步生成的字段验证（比如动态创建DOM字段）
 *  没有定义字段的验证规则，该插件只是定义了验证的书写方式
 *  若想增加常用字段的验证，请参考手册，非常简单
 *  css样式可以自行更改
 */
var checkObj = {
    checkFunc: {}, //验证数据的函数对象集合
    domConfig: {
        formItem: 'form-item', //验证的表单项
        errorContainer: 'error', //错误提示容器
        tipsContainer: 'tips', // 正常提示容器
        errorClass: 'error-border' // 验证错误时，给验证的表单元素添加的错误样式
    },
    
    // errorMessage:[],//错误消息
    // rightMessage:[],//正确消息
    showInfoFunc: {}, //显示消息的函数
    /*
     * 获取数据类型
     * @param { All }
     * @return data type
     */
    getType: function(data) {
        var to = Object.prototype.toString;
        if (data === null || data === undefined) {
            return data;
        }
        return to.call(data, null).slice(8, -1).toLowerCase() || 'string';
    },
    /*
     * 显示或隐藏提示信息
     * @param { Object }
     * @return { Object}
     */
    showMsg: function(opts) {
        var _that = this,
            errorClass = _that.domConfig.errorClass;
        return {
            _error: function() {
                opts.errorContainer.text(opts.checker.message).show();
                opts.checkElement.addClass(errorClass);
                opts.tipsContainer.hide();
            },
            OK: function() {
                opts.errorContainer.text('').hide();
                opts.checkElement.removeClass(errorClass);
            }
        };
    },
    // 此处验证，可以考虑把错误信息压到数组中进行处理
    // 对于不存在的tips，还需要进一步健壮处理
    check: function(checkElement, checkConfig) {
        var checkType, value,
            errorContainer, tipsContainer, i, validateArr, dLoop, dLen, domConfig = this.domConfig;
        // 获取数值这里，需要判断dom类型
        value = checkElement.val(); //获取当前的字段值

        var formItem = checkElement.parents('.' + domConfig.formItem);
        errorContainer = formItem.find('.' + domConfig.errorContainer);
        tipsContainer = formItem.find('.' + domConfig.tipsContainer);
        // 需要遍历checkConfig
        // 判断checkConfig是数组，还是对象，还是字符串
        checkType = this.getType(checkConfig);
        // 提示隐藏
        tipsContainer.hide();

        var domObj = {
            checkElement: checkElement,
            errorContainer: errorContainer,
            tipsContainer: tipsContainer
        };


        // 调用自定义函数
        // 应当还支持混合验证，即调用通用验证和自定义验证函数
        for (i in checkConfig) {
            if (i === 'tips' || i === 'isRequired' || i === 'ele') {
                // 验证条件的过滤
                // do nothing
            } else if (i === 'defaultValidate') {
                validateArr = checkConfig.defaultValidate;
                for (dLoop = 0, dLen = validateArr.length; dLoop < dLen; dLoop++) {
                    domObj.checker = this.checkFunc[validateArr[dLoop]];

                    if (!domObj.checker.validate(value)) {
                        this.showMsg(domObj)._error();

                        return false;
                    }
                }
            } else {
                domObj.checker = checkConfig[i];

                if (!domObj.checker.validate(value)) {
                    this.showMsg(domObj)._error();

                    return false;
                }
            }
        }
        this.showMsg(domObj).OK();
        return true;
    },
    tips: function(checkElement, checkName, checkConfig) {
        var errorContainer, tipsContainer,
            domConfig = this.domConfig;
        // 获取数值这里，需要判断dom类型
        errorContainer = checkElement.parents('.' + domConfig.formItem).find('.' + domConfig.errorContainer);
        tipsContainer = checkElement.parents('.' + domConfig.formItem).find('.' + domConfig.tipsContainer);
        // 需要遍历checkConfig
        // 判断checkConfig是数组，还是对象，还是字符串
        checkElement.removeClass(domConfig.errorClass);
        errorContainer.hide();
        // console.log(checkConfig);
        if (!checkConfig.tips) {
            tipsContainer.text('').hide();
        } else {
            tipsContainer.text(checkConfig.tips).show();
        }
    },
    initialize: function(formId, checkConfig, callback) {
        // 针对文本输入框进行blur事件绑定
        // 需要支持对无事件隐藏字段的绑定
        var that = this;
        var validateData = {};
        for (var prop in checkConfig) {
            if (checkConfig.hasOwnProperty(prop)) {
                validateData[prop] = checkConfig[prop].ele;
            }
        }
        $.each(validateData, function(i, ele) {
            ele.blur(function() {
                checkObj.check(ele, checkConfig[i]);
            }).focus(function() {
                checkObj.tips(ele, i, checkConfig[i]);
            });
        });

        formId.on('submit', function(e) {
            var flag = true;
            // 若验证全部完成，则进行表单提交
            // 进行表单必须字段的验证
            // 非必须字段提交可以绕过验证
            $.each(validateData, function(i, ele) {
                if (!!checkConfig[i].isRequired && !checkObj.check(ele, checkConfig[i])) {
                    flag = false;
                }
            });

            if (!!callback && (that.getType(callback) === 'function')) {
                //存在回调的情形
                flag && callback();
            } else {
                //使用默认提交的action
                // 阻止默认提交
                !flag && e.preventDefault();
                // flag && formId.get(0).submit();
            }
        });
    }
};
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
        if (/^[A-Za-z0-9]{2,16}?$/g.test(val) === false) {
            this.message = '用户名输入只能为数字，字母和下划线';
            return false;
        }
        if (val.length > 16 || val.length < 2) {
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
};
/*
 * 检查电子邮件
 */
checkObj.checkFunc.isEmail = {
    validate: function(val) {
        var _reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return _reg.test(val);
    },
    message: '请填写正确的邮件格式！' //错误消息
};
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
};
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
};
