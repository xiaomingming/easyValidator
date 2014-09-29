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
(function(w, $, undefined) {
    var Validator = function(formId, checkConfig) {
        // this.checkFunc = {};
        this.formId = formId;
        this.checkConfig = checkConfig;
        this.checkFunc = {
            isUserName: {
                validate: function(val, ele) {
                    var _reg = /[0-9a-zA-Z_-]/;
                    return _reg.test(val);
                },
                message: '请填写正确的用户名！' //错误消息
            },
            isEmpty: {
                validate: function(val, ele) {
                    return $.trim(val) !== '';
                },
                message: '输入不能为空！' //错误消息
            },
            isEmail: {
                validate: function(val, ele) {
                    var _reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
                    return _reg.test(val);
                },
                message: '请填写正确的邮件格式！' //错误消息
            }
        };
        // 此配置对html结构有依赖
        this.domConfig = {
            formItem: 'form-item', //验证的表单项类名
            errorContainer: 'error', //错误提示容器类名
            errorClass: 'error-border', // 验证错误时，给验证的表单元素添加的错误样式类名
            dataDefault: 'default' // 被验证的元素，默认值数据绑定属性设置 data-default
        };

    };
    Validator.prototype = {
        constructor: Validator,
        /*
         * 验证初始化
         * @param { Function } 表单验证完成后的回调函数
         * @return
         */
        initialize: function(callback) {
            // 针对文本输入框进行blur事件绑定
            // 需要支持对无事件隐藏字段的绑定
            var that = this,
                formId = this.formId,
                checkConfig = this.checkConfig;

            $.each(checkConfig, function(i, ele) {
                var checkEle = that.formId.find(ele.ele),
                    dText = checkEle.data(that.domConfig.dataDefault);
                // 验证事件绑定
                checkEle.on(that.evtType(checkEle), function() {
                    that.check(ele);
                });
                // 默认值的聚焦和失焦提示
                dText && checkEle.on('blur', function() {
                    that.defaultTip($(this), dText);
                }).on('focus', function() {
                    that.defaultTip($(this), dText);
                });
            });
            // 表单提交绑定
            formId.on('submit', function(e) {
                var flag = true;
                // 若验证全部完成，则进行表单提交
                // 进行表单必须字段的验证
                // 非必须字段提交可以绕过验证
                $.each(checkConfig, function(i, ele) {
                    if (!!ele.isRequired && !that.check(ele)) {
                        flag = false;
                    }
                });
                if (!!callback && (that.dataType(callback) === 'function')) {
                    //存在回调的情形
                    flag && callback();
                } else {
                    // 阻止默认提交
                    !flag && e.preventDefault();
                }
            });
            return this;
        },
        setCheckConfig: function(config) {
            this.checkConfig = $.extend(true, this.checkConfig, config);
            return this;
        },
        /*
         * 获取数据类型
         * @param { All }
         * @return data type
         */
        dataType: function(data) {
            var to = Object.prototype.toString;
            if (data === null || data === undefined) {
                return data;
            }
            return to.call(data, null).slice(8, -1).toLowerCase();
        },
        /*
         * 获取html标签对应的事件类型
         * @param { DOMElement }
         * @return event string
         */
        evtType: function(ele) {
            var tName = ele.get(0).tagName.toLowerCase(),
                eleType = ele.attr('type');
            if (tName === 'select' || (tName === 'input' && eleType === 'checkbox')) {
                return 'change';
            }
            return 'blur';
        },
        /*
         * 显示或隐藏错误信息
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
                },
                OK: function() {
                    opts.errorContainer.text('').hide();
                    opts.checkElement.removeClass(errorClass);
                }
            };
        },
        /*
         * 输入框聚焦和失去焦点时默认值的消失
         * @param { DomElement } 输入框
         * @param { String } 输入框的默认值
         * @return
         */
        defaultTip: function(ele, dText) {
            var val = ele.val();
            if ($.trim(val) === dText) {
                ele.val('');
            }
        },
        /*
         * 检测是否通过验证
         * @param { Object } 配置对象
         * @return
         */
        check: function(checkConfig) {
            var checkElement = this.formId.find(checkConfig.ele);
            var checkType, value,
                errorContainer, i, validateArr, dLoop, dLen, domConfig = this.domConfig;
            // 获取数值这里，需要判断dom类型
            value = checkElement.val(); //获取当前的字段值

            var formItem = checkElement.parents('.' + domConfig.formItem);
            errorContainer = formItem.find('.' + domConfig.errorContainer);
            // 需要遍历checkConfig
            // 判断checkConfig是数组，还是对象，还是字符串
            checkType = this.dataType(checkConfig);

            var domObj = {
                checkElement: checkElement,
                errorContainer: errorContainer
            };

            // 调用自定义函数
            // 应当还支持混合验证，即调用通用验证和自定义验证函数
            for (i in checkConfig) {
                if (i === 'tips' || i === 'isRequired' || i === 'ele' || i === 'defaultVal') {
                    // 验证条件的过滤
                    // do nothing
                } else if (i === 'defaultValidate') {
                    validateArr = checkConfig.defaultValidate;
                    for (dLoop = 0, dLen = validateArr.length; dLoop < dLen; dLoop++) {
                        domObj.checker = this.checkFunc[validateArr[dLoop]];

                        if (!domObj.checker.validate(value, checkElement)) {
                            this.showMsg(domObj)._error();
                            return false;
                        }
                    }
                } else {
                    domObj.checker = checkConfig[i];

                    if (!domObj.checker.validate(value, checkElement)) {
                        this.showMsg(domObj)._error();
                        return false;
                    }
                }
            }
            this.showMsg(domObj).OK();
            return true;
        }

    };
    window.EasyValidator = Validator;
})(window, jQuery, undefined);
